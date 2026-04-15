import scrapy
import json
import re
from praksonar.items import InternshipItem
from praksonar.utils import clean_description, extract_skills, extract_languages, parse_deadline, clean_url

class HelloWorldSpider(scrapy.Spider):
    name = "helloworldrs"
    allowed_domains = ["helloworld.rs"]
    start_urls = ["https://www.helloworld.rs/prakse"]

    run_id = None

    def parse(self, response):
        # Find all job links that are specific to job details
        listing_urls = response.css('a[href^="/posao/"]::attr(href)').getall()
        # Ensure they are unique
        listing_urls = list(set(listing_urls))
        
        for rel_url in listing_urls:
            full_url = response.urljoin(rel_url)
            yield scrapy.Request(full_url, callback=self.parse_details)

        # Pagination
        next_page = response.xpath('//a[contains(@class, "next") or contains(text(), "Slede")]/@href').get()
        if next_page:
           yield response.follow(next_page, self.parse)

    def parse_details(self, response):
        try:
            item = InternshipItem()
            item['source_url'] = clean_url(response.url)
            item['source_name'] = 'HelloWorld'
            item['is_international'] = False
            
            # The schema is usually the best source of info
            scripts = response.xpath('//script[@type="application/ld+json"]//text()').getall()
            
            job_data = {}
            for script_text in scripts:
                if 'JobPosting' in script_text:
                    try:
                        data = json.loads(script_text)
                        if isinstance(data, list):
                            for jd in data:
                                if jd.get('@type') == 'JobPosting':
                                    job_data = jd
                                    break
                        elif data.get('@type') == 'JobPosting':
                            job_data = data
                            
                        if job_data:
                            break
                    except Exception:
                        pass
            
            if not job_data:
                item['title'] = response.css('h1::text').get(default='').strip()
                item['company'] = response.css('.employer-name::text').get(default='').strip()
                # Use DOM for description if schema is missing or lacks it
                desc_html = response.css('.job-description').get()
                if not desc_html:
                    desc_html = response.css('.__job-text-body').get()
                if not desc_html:
                    desc_html = response.css('main').get()
                    
                desc_html = desc_html or ''
            else:
                item['title'] = job_data.get('title', '')
                
                company_node = job_data.get('hiringOrganization', {})
                if isinstance(company_node, dict):
                    item['company'] = company_node.get('name', '')
                else:
                    item['company'] = str(company_node)
                    
                location_node = job_data.get('jobLocation', {})
                if isinstance(location_node, list) and len(location_node) > 0:
                    location_node = location_node[0]
                if isinstance(location_node, dict):
                    address_node = location_node.get('address', {})
                    if isinstance(address_node, dict):
                        item['location'] = address_node.get('addressLocality', '')
                else:
                    item['location'] = ''
                
                dt_valid = str(job_data.get('validThrough', ''))[:10]
                dt_posted = str(job_data.get('datePosted', ''))[:10]
                item['deadline'] = parse_deadline(dt_valid)
                item['created_at'] = parse_deadline(dt_posted)
                
                desc_html = job_data.get('description', '')

            # Enforce DOM extraction if schema description is empty or too short
            dom_desc = response.css('.job-description').get()
            if not dom_desc:
                dom_desc = response.css('.__job-text-body').get()
            if not dom_desc:
                dom_desc = response.css('.__job-content').get()

            if dom_desc and len(dom_desc) > len(desc_html):
                desc_html = dom_desc

            # Fallback for location using standard meta tags or title
            if not item.get('location'):
                page_title = response.css('title::text').get(default='')
                parts = [p.strip() for p in page_title.split('|')]
                if len(parts) >= 3:
                    # Title | Company | Location | HelloWorld.rs
                    item['location'] = parts[2]
            
            # Extract Seniority from gaEventData
            seniority_match = re.search(r'"job_seniority"\s*:\s*"([^"]+)"', response.text)
            if seniority_match:
                # Add it as a required skill since our schema doesn't have a seniority column yet, or prepend it
                seniority = seniority_match.group(1).lower()
                # We can store this in the title or skills if needed, or if Praksonar has a field for it, 
                # but currently schema is standard. The prompt asked to "Extract seniority level (e.g. 'junior')"
                # We'll just leave it extracted and if there's a field we'd map it. Let's add it to title to preserve it,
                # or better, keep it in memory. If Praksonar doesn't have a seniority column, I'll add it to skills.
                pass
                
            # If still no deadline, regex the page
            if not item.get('deadline'):
                date_matches = re.findall(r'\b(\d{1,2}\.\d{1,2}\.\d{4}\.?)\b', response.text)
                if date_matches:
                    for dm in date_matches:
                        parsed = parse_deadline(dm)
                        if parsed:
                            item['deadline'] = parsed
                            break

            # Extract clean description
            item['description'] = clean_description(desc_html)
            
            # Extract skills and languages from the full text
            desc_sel = scrapy.Selector(text=desc_html)
            all_texts = desc_sel.xpath('//text()').getall()
            full_text = ' '.join([t.strip() for t in all_texts if t.strip()])
                
            # Specific Section Requirements Extraction
            req_skills_raw = []
            nice_to_have_raw = []
            
            elements = desc_sel.xpath('//p | //div | //ul | //li | //strong | //b | //h2 | //h3 | //h4 | //text()')
            current_mode = None
            
            for el in elements:
                if type(el.root) is str:
                    text_val = el.root.strip().lower()
                    if re.search(r'\b(zahtevi|requirements|uslovi|potrebno|kvalifikacij|profil|kandidat|in your daily work)\b', text_val):
                        current_mode = 'req'
                    elif re.search(r'\b(nice to have|pozeljno|poželjno|prednost|bonus|dodatno)\b', text_val):
                        current_mode = 'nice'
                    elif re.search(r'\b(nudimo|benefiti|we offer|sta nudimo|what we offer|benefits)\b', text_val):
                        current_mode = 'ignore'
                elif el.root.tag == 'ul' and current_mode in ['req', 'nice']:
                    for li in el.xpath('.//li'):
                        li_text = " ".join(li.xpath('.//text()').getall()).strip()
                        if li_text:
                            if current_mode == 'req':
                                req_skills_raw.append(li_text)
                            else:
                                nice_to_have_raw.append(li_text)
                    current_mode = None
            
            # Fallback if specific sections weren't clearly structured
            if not req_skills_raw and not nice_to_have_raw:
                for li in desc_sel.css('li'):
                    li_text = " ".join(li.css('*::text').getall()).strip()
                    if li_text:
                        req_skills_raw.append(li_text)
                        
            # Combine Requirements and Nice-to-haves
            all_requirements = req_skills_raw + nice_to_have_raw
            
            # If Praksonar has a seniority field in the schema, it can be passed via meta or similar
            # Since standard schema doesn't include it in `items.py` we can prepend it to description or skills for now
            if seniority_match:
                seniority_str = seniority_match.group(1).title()
                # Prepend to skills so users can see the required seniority natively
                all_requirements.insert(0, f"Senioritet: {seniority_str}")
                        
            item['required_skills'] = extract_skills(all_requirements)
            item['required_languages'] = extract_languages(full_text)
            
            # Skip reCAPTCHA protected pages
            if "protected by reCAPTCHA" in full_text and not item['title']:
                self.logger.warning(f"Hit reCAPTCHA protection on {response.url}. Skipping.")
                return

            yield item
            
        except Exception as e:
            self.logger.error(f"Error extracting details from {response.url}: {e}")
