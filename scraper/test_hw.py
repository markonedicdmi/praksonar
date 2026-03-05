import urllib.request
from parsel import Selector

url = 'https://www.helloworld.rs/oglasi-za-posao'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
sel = Selector(text=html)

# Let's find the job cards
cards = sel.css('div.job-item') 
if not cards:
    # try other classes, maybe they use article or a different div
    cards = sel.xpath('//a[contains(@href, "/oglas/")]/ancestor::div[1]')
    if not cards:
        cards = sel.css('a[href*="/oglas/"]')

print(f"Found {len(cards)} potential job listings")
if len(cards) > 0:
    first_url = cards[0].attrib.get('href') if cards[0].root.tag == 'a' else cards[0].css('a::attr(href)').get()
    print("First listing url:", first_url)
    
    # Let's hit the detail page and see how to get info
    if first_url and first_url.startswith('/'):
        detail_url = 'https://www.helloworld.rs' + first_url
        print(f"Fetching {detail_url}")
        detail_html = urllib.request.urlopen(urllib.request.Request(detail_url, headers={'User-Agent': 'Mozilla/5.0'})).read().decode('utf-8')
        dsel = Selector(text=detail_html)
        print("Title:", dsel.css('h1::text').get())
        print("Company:", dsel.css('h2.employer-name::text').get() or dsel.css('.company-name::text').get() or 'not found')
        print("JSON-LD elements:", len(dsel.xpath('//script[@type="application/ld+json"]')))
