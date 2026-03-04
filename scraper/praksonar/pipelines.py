import os
import logging
from itemadapter import ItemAdapter
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timezone

# Explicitly load .env from the scraper directory, regardless of where scrapy is run from
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '..', '.env')
load_dotenv(dotenv_path=env_path)

class SupabasePipeline:
    def __init__(self):
        self.url: str = os.environ.get("SUPABASE_URL", "")
        self.key: str = os.environ.get("SUPABASE_KEY", "")
        self.supabase: Client | None = None
        self.new_internships_count = 0

    def open_spider(self, spider):
        if not self.url or not self.key:
            spider.logger.warning("SUPABASE_URL or SUPABASE_KEY missing. Pipeline disabled.")
            return
            
        try:
            self.supabase = create_client(self.url, self.key)
            spider.logger.info("Connected to Supabase.")
        except Exception as e:
            spider.logger.error(f"Failed to connect to Supabase: {e}")

    def close_spider(self, spider):
        spider.logger.info(f"Spider closed. Upserted {self.new_internships_count} internships.")

        # Update the scrape_runs row if a run_id was passed via spider args
        run_id = getattr(spider, 'run_id', None)
        if run_id and self.supabase:
            try:
                self.supabase.table('scrape_runs').update({
                    'status': 'completed',
                    'new_count': self.new_internships_count,
                    'finished_at': datetime.now(timezone.utc).isoformat(),
                }).eq('id', run_id).execute()
                spider.logger.info(f"Updated scrape_run {run_id}: completed with {self.new_internships_count} items.")
            except Exception as e:
                spider.logger.error(f"Failed to update scrape_run {run_id}: {e}")

    def process_item(self, item, spider):
        if not self.supabase:
            return item
            
        adapter = ItemAdapter(item)
        source_url = adapter.get('source_url')
        
        if not source_url:
            spider.logger.warning("Item missing source_url. Skipping.")
            return item

        try:
            data_dict = adapter.asdict()
            data_dict['updated_at'] = datetime.now(timezone.utc).isoformat()

            self.supabase.table('internships').upsert(
                data_dict,
                on_conflict='source_url'
            ).execute()
            
            self.new_internships_count += 1
            spider.logger.info(f"Upserted internship: {adapter.get('title')} at {adapter.get('company')}")
            
        except Exception as e:
            spider.logger.error(f"Failed to process item {source_url}: {e}")
            
        return item
