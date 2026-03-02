import scrapy

class InternshipItem(scrapy.Item):
    title = scrapy.Field()
    company = scrapy.Field()
    description = scrapy.Field()
    location = scrapy.Field()
    is_international = scrapy.Field()
    field = scrapy.Field()
    required_skills = scrapy.Field()
    required_languages = scrapy.Field()
    source_url = scrapy.Field()
    source_name = scrapy.Field()
    deadline = scrapy.Field()
    created_at = scrapy.Field()
