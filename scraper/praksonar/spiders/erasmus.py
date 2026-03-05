import scrapy
from praksonar.items import InternshipItem
from praksonar.utils import clean_description, extract_skills, extract_languages, parse_deadline, clean_url

class ErasmusSpider(scrapy.Spider):
    name = "erasmus"
    allowed_domains = ["erasmus-plus.ec.europa.eu", "erasmusintern.org"]
    
    # We start at the exact URL requested, but we add query parameters if we can find them.
    # Often, Drupal sites use ?search= or ?f[0]=country:RS
    start_urls = [
        "https://erasmus-plus.ec.europa.eu/opportunities"
    ]

    run_id = None

    def parse(self, response):
        # Look for opportunity links (usually standard a tags inside cards or views-rows)
        # We also might find links pointing to erasmusintern.org where actual traineehips are hosted.
        listing_urls = response.css('a[href*="/opportunities/"]::attr(href)').getall()
        # Fallback to erasmusintern links if found
        listing_urls += response.css('a[href*="erasmusintern.org/traineeship/"]::attr(href)').getall()
        
        listing_urls = list(set(listing_urls))
        for url in listing_urls:
            full_url = response.urljoin(url)
            # Filter for Serbian relevance or simply follow everything and filter later
            # It's easier to follow all and then extract if it's international
            yield scrapy.Request(full_url, callback=self.parse_details)

        # Look for standard pagination
        next_page = response.css('.pager__item--next a::attr(href)').get()
        if next_page:
            yield response.follow(next_page, self.parse)

    def parse_details(self, response):
        try:
            item = InternshipItem()
            item['source_url'] = clean_url(response.url)
            item['source_name'] = 'Erasmus'
            item['is_international'] = True

            # Try to grab title from h1 or specific page title class
            title = response.css('h1::text').get(default='').strip()
            if not title:
                title = response.css('.page-title::text').get(default='').strip()
            item['title'] = title

            # Company/Organization Name
            # Often found in a specific field or h2
            company = response.xpath('//div[contains(@class, "organization") or contains(@class, "company")]//text()').get()
            if not company:
                company = response.xpath('//th[contains(text(), "Organization")]/following-sibling::td/text()').get()
            item['company'] = str(company).strip() if company else "Erasmus+ Organization"

            # Location
            location = response.xpath('//th[contains(text(), "Location")]/following-sibling::td/text()').get()
            item['location'] = str(location).strip() if location else "EU / International"

            # Description
            desc_blocks = response.css('.field--name-body, .description-content, article').getall()
            if not desc_blocks:
                desc_blocks = [" ".join(response.css('p').getall())]
            
            desc_html = " ".join(desc_blocks)
            item['description'] = clean_description(desc_html)

            # Extract fields via xpath from the text
            desc_sel = scrapy.Selector(text=desc_html)
            all_texts = desc_sel.xpath('//text()').getall()
            full_text = ' '.join([t.strip() for t in all_texts if t.strip()])
            
            # Skills and Languages
            item['required_skills'] = extract_skills(full_text)
            item['required_languages'] = extract_languages(full_text)

            # Deadline extraction
            # Usually labeled as Deadline, Closing date, or Valid until
            deadline_str = response.xpath('//*[contains(translate(text(), "DEADLINE", "deadline"), "deadline") or contains(translate(text(), "CLOSING", "closing"), "closing")]/following-sibling::*/text()').get()
            if not deadline_str:
                deadline_str = response.xpath('//*[contains(translate(text(), "DEADLINE", "deadline"), "deadline")]/text()').re_first(r'\d{1,2}[\./\-]\d{1,2}[\./\-]\d{2,4}')
                
            item['deadline'] = parse_deadline(deadline_str)
            item['created_at'] = None # Often not provided or buried in metadata

            if item['title'] and len(item['title']) > 3:
                yield item
            else:
                self.logger.warning(f"Skipping {response.url}: missing valid title")

        except Exception as e:
            self.logger.error(f"Error extracting details from {response.url}: {e}")
