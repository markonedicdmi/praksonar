import urllib.request
from parsel import Selector

req = urllib.request.Request('https://startuj.infostud.com/posao/mobility-aftermarket-sales-department-intern-717430', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8')
sel = Selector(text=html)

print('Rok:', sel.xpath('//span[contains(text(), "Rok za prijavu")]/parent::span/following-sibling::span/text()').get())
print('Postavljeno:', sel.xpath('//span[contains(text(), "Postavljeno")]/parent::span/following-sibling::span/text()').get())
