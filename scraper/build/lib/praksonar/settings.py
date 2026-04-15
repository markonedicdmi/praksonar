import os

# dotenv is only needed locally — Scrapy Cloud injects env vars via its dashboard
try:
    from dotenv import load_dotenv
    current_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(current_dir, '..', '.env')
    load_dotenv(dotenv_path=env_path)
except ImportError:
    pass

BOT_NAME = "praksonar"

SPIDER_MODULES = ["praksonar.spiders"]
NEWSPIDER_MODULE = "praksonar.spiders"

# Obey robots.txt rules
ROBOTSTXT_OBEY = False

# Configure item pipelines
# See https://docs.scrapy.org/en/latest/topics/item-pipeline.html
ITEM_PIPELINES = {
   "praksonar.pipelines.SupabasePipeline": 300,
}

# Set settings whose default value is deprecated to a future-proof value
REQUEST_FINGERPRINTER_IMPLEMENTATION = "2.7"
TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
FEED_EXPORT_ENCODING = "utf-8"

# Politeness: don't hammer target sites
DOWNLOAD_DELAY = 1.5
CONCURRENT_REQUESTS = 8
CONCURRENT_REQUESTS_PER_DOMAIN = 2

# AutoThrottle: dynamically adjust delay based on server response times
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 1
AUTOTHROTTLE_MAX_DELAY = 10
AUTOTHROTTLE_TARGET_CONCURRENCY = 2.0

# User Agent
USER_AGENT = "Praksonar/1.0 (+https://praksonar.com)"
