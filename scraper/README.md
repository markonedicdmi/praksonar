# Praksonar Scraper

This is a Scrapy project designed to run on a schedule and fetch internship listings, inserting them directly into the Praksonar Supabase database.

## Spiders Included
- **Infostud** (`infostud`): Scrapes tech/general internships from startuj.infostud.com
- **HelloWorld** (`helloworldrs`): Scrapes tech internships from helloworld.rs.
- **Erasmus** (`erasmus`): Scrapes international Erasmus+ opportunities. 
- **LinkedIn** (`linkedin`): Scrapes public internships for Serbia. *Note: LinkedIn actively blocks scrapers and often returns 429 Too Many Requests or serves auth-walls. This spider may need Zyte's smart proxy (Zyte API) to work reliably.*

## Prerequisites
1. Python 3.10+
2. A Supabase project (for the Database URL and Service Role Key)
3. A Zyte (Scrapinghub) project if deploying to cloud.

## Local Development

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and fill in your Supabase credentials. **Use your Service Role key** to bypass RLS policies for inserting server-side data.
   
   *Note: Zyte API variables are primarily used when deploying or utilizing their smart proxies.*
   
   ```bash
   cp .env.example .env
   ```

3. **Run a Single Spider Locally:**
   Execute a spider by name. You can use `-s CLOSESPIDER_ITEMCOUNT=5` to limit the scrape for testing:
   ```bash
   scrapy crawl infostud -s CLOSESPIDER_ITEMCOUNT=5
   scrapy crawl helloworldrs -s CLOSESPIDER_ITEMCOUNT=5
   scrapy crawl erasmus
   scrapy crawl linkedin
   ```

## SupabasePipeline Upsert Logic
The scraper utilizes `praksonar.pipelines.SupabasePipeline`. 
It ensures no duplicate internships are inserted by relying on the **`source_url`** as the unique identifier.
The pipeline automatically scrubs tracking parameters from URLs using `utils.clean_url()` to maintain consistency. If an internship with the same `source_url` exists, it skips/upserts.

## Adding a New Spider (Step-by-Step)
1. **Create the file**: Create a new `.py` file inside `praksonar/spiders/`.
2. **Setup the Spider**: Inherit from `scrapy.Spider` and set `name`, `allowed_domains`, and `start_urls`.
3. **Use Shared Utilities**: Import extraction logic from `praksonar.utils` to keep skills, languages, descriptions, and deadlines standardized:
   ```python
   from praksonar.utils import clean_description, extract_skills, extract_languages, parse_deadline, clean_url
   ```
4. **Ensure Gentle Fails**: Wrap item extraction logic in `try/except` blocks to prevent single page errors from crashing the whole spider run.
5. **Yield the Item**: Yield a populated `InternshipItem` from `praksonar.items`. The pipeline will automatically upsert it.

## Deployment to Zyte Cloud (Scrapy Cloud)

We use Zyte Cloud to independently schedule our spiders without managing a server.

1. **Install Shub:**
   ```bash
   pip install shub
   ```

2. **Login to Scrapinghub / Zyte:**
   ```bash
   shub login
   ```
   *Provide your `ZYTE_API_KEY` when prompted.*

3. **Update `scrapy.cfg`:**
   Open `scrapy.cfg` and ensure the `project` variable is set to your actual Scrapy Cloud Project ID (e.g. `123456`).

4. **Deploy the Project:**
   ```bash
   shub deploy
   ```

5. **Configure Environment in Zyte:**
   Go to your project dashboard on Zyte Cloud -> Spiders -> Settings -> Spider Settings. Add your `SUPABASE_URL` and `SUPABASE_KEY` as environment variables there so the deployed spider can reach your database.

### Setting up the Daily Schedule on Zyte Cloud
1. Go to your Scrapy Cloud project dashboard.
2. Navigate to **Periodic Jobs**.
3. Create a new periodic job for **each spider** (`infostud`, `helloworldrs`, `erasmus`, `linkedin`).
4. Set the schedule for each to run daily at `06:00 UTC` (or staggering them: e.g. 06:00, 06:15, 06:30, 06:45). 
5. Because they are scheduled independently, one spider's failure or block (like LinkedIn) will **not block** the others from running successfully.
