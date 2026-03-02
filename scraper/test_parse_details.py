import urllib.request
import json
from parsel import Selector
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

req = urllib.request.Request('https://startuj.infostud.com/posao/hse-intern-717224', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
sel = Selector(text=html)

scripts = sel.xpath('//script[@type="application/ld+json"]//text()').getall()
desc_html = ""
for script_text in scripts:
    if 'JobPosting' in script_text:
        try:
            data = json.loads(script_text)
            desc_html = data.get('description', '')
        except:
            pass

if desc_html:
    desc_sel = Selector(text=desc_html)
    all_texts = desc_sel.xpath('//text()').getall()
    clean_texts = [t.strip() for t in all_texts if t.strip()]
    print("ALL CLEAN TEXTS:")
    for t in clean_texts[:30]:
        print(t)
