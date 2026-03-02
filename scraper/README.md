# Praksonar Scraper

This is a Scrapy project designed to run on a schedule and fetch internship listings, inserting them directly into the Praksonar Supabase database.

## Prerequisites
1. Python 3.10+
2. A Supabase project (for the Database URL and Service Role Key)

## Local Development

1. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env` and fill in your Supabase credentials. **Use your Service Role key** to bypass RLS policies for inserting server-side data.
   ```bash
   cp .env.example .env
   ```

3. **Run the Spider Locally:**
   ```bash
   scrapy crawl infostud
   ```
   The spider will scrape the listings, check the Supabase database for duplicates via `source_url`, and insert any new internships. 

## Deployment to Zyte Cloud (Scrapy Cloud)

Since we are using Scrapy Cloud, you can deploy this project using the `shub` command-line tool.

1. **Install Shub:**
   ```bash
   pip install shub
   ```

2. **Login to Scrapinghub / Zyte:**
   ```bash
   shub login
   ```
   *Provide your API key when prompted.*

3. **Update `scrapy.cfg`:**
   Open `scrapy.cfg` and replace `YOUR_ZYTE_PROJECT_ID` with your actual Zyte project ID.

4. **Deploy the Project:**
   ```bash
   shub deploy
   ```

5. **Configure Environment in Zyte:**
   Go to your project dashboard on Zyte Cloud -> Spiders -> Settings -> Spider Settings. Add your `SUPABASE_URL` and `SUPABASE_KEY` as environment variables there so the deployed spider can reach your database.
