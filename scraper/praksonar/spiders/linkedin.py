# WARNING: LinkedIn actively blocks scrapers and often returns 429 Too Many Requests
# or serves auth-walls. This spider may need Zyte's smart proxy (Zyte API) to work reliably.
# We are using rotating user agents as a basic measure.

import scrapy
import re
import json
from praksonar.items import InternshipItem
from praksonar.utils import clean_description, extract_skills, extract_languages, parse_deadline, clean_url

class LinkedinSpider(scrapy.Spider):
    name = "linkedin"
    allowed_domains = ["linkedin.com"]
    # Search for Internships in Serbia
    start_urls = ["https://www.linkedin.com/jobs/search?keywords=&location=Serbia&geoId=101855366&f_JT=I"]
    
    run_id = None

    # Enable custom settings for rotating UAs and gentle fail
    custom_settings = {
        'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'HTTPERROR_ALLOW_ALL': True, # Gentle fail: capture all HTTP responses
        'DOWNLOAD_DELAY': 2, # Be polite
    }

    def parse(self, response):
        if response.status != 200:
            self.logger.warning(f"LinkedIn blocked or returned non-200 status [{response.status}]. Skipping gracefully to prevent scraper crash.")
            return
            
        # LinkedIn public pages usually list jobs in `.base-card`
        job_links = response.css('a.base-card__full-link::attr(href)').getall()
        # Ensure we unique them
        job_links = list(set(job_links))
        
        for link in job_links:
            # We must clean the linkedin url before requesting since it comes with huge tracking params
            clean_job_url = link.split('?')[0]
            yield scrapy.Request(clean_job_url, callback=self.parse_details, cb_kwargs={'original_url': clean_job_url})

    def parse_details(self, response, original_url):
        if response.status != 200:
            self.logger.warning(f"Skipping details for {original_url} due to non-200 status [{response.status}].")
            return
            
        try:
            item = InternshipItem()
            item['source_url'] = clean_url(original_url)
            item['source_name'] = 'LinkedIn'
            item['is_international'] = False
            
            # Extract basic data
            title = response.css('h1.top-card-layout__title::text').get(default='').strip()
            if not title:
                title = response.css('.topcard__title::text').get(default='').strip()
            item['title'] = title
            
            company = response.css('a.topcard__org-name-link::text').get(default='').strip()
            if not company:
                company = response.css('.topcard__flavor--black-link::text').get(default='').strip()
            item['company'] = company
            
            location = response.css('span.topcard__flavor--bullet::text').get(default='').strip()
            item['location'] = location
            
            # Post date is sometimes recorded in a time tag
            posted_time_ago = response.css('span.posted-time-ago__text::text').get(default='').strip()
            # If we need absolute date, unfortunately public pages often say '3 days ago'.
            # We will just set it to None and let Supabase timestamp it, or we can look for schema
            
            # We look for schema-ld to get exact date
            scripts = response.xpath('//script[@type="application/ld+json"]//text()').getall()
            job_data = {}
            for script_text in scripts:
                if 'JobPosting' in script_text:
                    try:
                        job_data = json.loads(script_text)
                        break
                    except Exception:
                        pass
                        
            if job_data:
                if not item['title']:
                    item['title'] = job_data.get('title', '')
                if not item['company']:
                    company_node = job_data.get('hiringOrganization', {})
                    if isinstance(company_node, dict):
                        item['company'] = company_node.get('name', '')
                
                dt_posted = str(job_data.get('datePosted', ''))[:10]
                item['created_at'] = parse_deadline(dt_posted)
                
            # Deadline extraction: try JSON-LD first, then DOM, then None
            deadline = None
            if job_data:
                deadline_str = job_data.get('validThrough') or job_data.get('applicationDeadline') or ''
                deadline_str = str(deadline_str)[:10]  # Trim to YYYY-MM-DD
                deadline = parse_deadline(deadline_str)
            
            if not deadline:
                # Check DOM for "Apply before" or similar text with a date
                apply_before = response.xpath(
                    '//span[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "apply before")]'
                    '/following-sibling::*//text()'
                ).get(default='').strip()
                if not apply_before:
                    apply_before = response.xpath(
                        '//span[contains(translate(text(), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "deadline")]'
                        '/following-sibling::*//text()'
                    ).get(default='').strip()
                if apply_before:
                    deadline = parse_deadline(apply_before)
            
            item['deadline'] = deadline  # None if no deadline found — never crash
            
            # Description
            desc_html = " ".join(response.css('.show-more-less-html__markup').getall())
            if not desc_html and job_data:
                desc_html = job_data.get('description', '')
                
            item['description'] = clean_description(desc_html)
            
            # Extract skills & languages
            desc_sel = scrapy.Selector(text=desc_html)
            all_texts = desc_sel.xpath('//text()').getall()
            full_text = ' '.join([t.strip() for t in all_texts if t.strip()])
            
            req_skills = []
            elements = desc_sel.xpath('//p | //div | //ul | //li | //strong | //b | //h2 | //h3 | //h4 | //text()')
            looking_for_reqs = False
            found_dedicated_list = False
            
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
                    found_dedicated_list = True
            
            if not found_dedicated_list:
                for li in desc_sel.css('li'):
                    li_text = " ".join(li.css('*::text').getall()).strip()
                    if li_text:
                        req_skills.append(li_text)
                        
            item['required_skills'] = extract_skills(req_skills)
            item['required_languages'] = extract_languages(full_text)
            
            # We ensure we only yield valid postings
            if item['title']:
                yield item
                
        except Exception as e:
            self.logger.error(f"Error extracting details from LinkedIn {original_url}: {e}")
