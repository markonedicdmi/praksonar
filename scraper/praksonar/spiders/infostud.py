import scrapy
from datetime import datetime
from praksonar.items import InternshipItem
from praksonar.utils import clean_description, extract_skills, extract_languages, parse_deadline, clean_url

class InfostudSpider(scrapy.Spider):
    name = "infostud"
    allowed_domains = ["startuj.infostud.com"]
    start_urls = ["https://startuj.infostud.com/prakse"]

    # Optional: passed via -a run_id=<uuid> so pipeline can update scrape_runs
    run_id = None

    def parse(self, response):
        # Loop through listing elements on the search page
        listings = response.css('a.__job_card')
        
        for listing in listings:
            try:
                item = InternshipItem()
                
                # Element is an <a> tag itself, so URL is its href
                item['source_url'] = clean_url(response.urljoin(listing.attrib.get('href', '')))
                
                title_elem = listing.css('h2::text').get(default='').strip()
                if not title_elem:
                    continue
                item['title'] = title_elem
                
                # Company Name usually found in h3 inside the card
                item['company'] = listing.css('h3::text').get(default='').strip()
                
                # Location is in a span following the map-pin icon
                location_text = listing.xpath('.//i[contains(@class, "ph-map-pin")]/following-sibling::*//span/text()').get(default='').strip()
                item['location'] = location_text
                
                item['source_name'] = 'Infostud'
                item['is_international'] = False
                
                if item['source_url']:
                     yield scrapy.Request(
                         item['source_url'], 
                         callback=self.parse_details,
                         meta={'item': item}
                     )
            except Exception as e:
                self.logger.error(f"Error parsing listing node: {e}")
                continue

        # Follow Pagination
        next_page = response.css('a[rel="next"]::attr(href)').get()
        if not next_page:
            # Sometime it's under an aria-label or specific pagination class
            next_page = response.xpath('//a[contains(@aria-label, "Next") or contains(text(), "Slede")]/@href').get()
            
        if next_page:
            yield response.follow(next_page, self.parse)

    def parse_details(self, response):
        item = response.meta['item']
        
        try:
            # If location was not captured from listing card, try the detail page
            if not item.get('location'):
                loc = response.css('span.job-location::text').get(default='').strip()
                if not loc:
                    loc = response.xpath('//i[contains(@class, "ph-map-pin")]/following-sibling::*//span/text()').get(default='').strip()
                item['location'] = loc

            # Look for structured JSON-LD data which contains the raw job description
            scripts = response.xpath('//script[@type="application/ld+json"]//text()').getall()
            desc_html = ""
            for script_text in scripts:
                if 'JobPosting' in script_text:
                    import json
                    try:
                        data = json.loads(script_text)
                        desc_html = data.get('description', '')
                        break
                    except Exception:
                        pass
            
            # If we got the HTML description from schema, parse it
            if desc_html:
                desc_sel = scrapy.Selector(text=desc_html)
                
                # Extract clean description (html entities decoded, UI artifacts removed)
                item['description'] = clean_description(desc_html)
                
                all_texts = desc_sel.xpath('//text()').getall()
                full_text = ' '.join([t.strip() for t in all_texts if t.strip()])
                
                # Extract requirements from structured section only — no fallback to all LIs
                req_skills = []
                import re
                
                elements = desc_sel.xpath('//p | //div | //ul | //li | //strong | //b | //h2 | //h3 | //h4 | //text()')
                
                looking_for_reqs = False
                
                for el in elements:
                    if type(el.root) is str:
                        text_val = el.root.strip().lower()
                        if re.search(r'uslovi|obavezni|potrebno|kvalifikacij|profil|kandidat|requirements|qualifications', text_val):
                            looking_for_reqs = True
                    elif el.root.tag == 'ul' and looking_for_reqs:
                        for li in el.xpath('.//li'):
                            li_text = " ".join(li.xpath('.//text()').getall()).strip()
                            if li_text:
                                req_skills.append(li_text)
                        looking_for_reqs = False
                            
                item['required_skills'] = extract_skills(req_skills)
                item['required_languages'] = extract_languages(full_text)

            # Extract deadline and post date exactly from the individual page DOM
            rok_str = response.xpath('//span[contains(text(), "Rok za prijavu")]/parent::span/following-sibling::span/text()').get()
            post_str = response.xpath('//span[contains(text(), "Postavljeno")]/parent::span/following-sibling::span/text()').get()
            
            item['deadline'] = parse_deadline(rok_str)
            parsed_post = parse_deadline(post_str)
            if parsed_post:
                item['created_at'] = parsed_post
            
        except Exception as e:
            self.logger.error(f"Error extracting details from {response.url}: {e}")
            
        yield item

