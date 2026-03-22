import urllib.request
import re
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request('https://www.rightscon.org/', headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, context=ctx).read().decode('utf-8')

css_links = re.findall(r'<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>', html)

css_content = ''
for link in css_links:
    if 'rightscon' in link and '.css' in link:
        try:
            url = link if link.startswith('http') else 'https://www.rightscon.org' + link
            req2 = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            css_content += urllib.request.urlopen(req2, context=ctx).read().decode('utf-8')
        except Exception as e:
            pass

colors = list(set(re.findall(r'--[\w-]+:\s*(#[0-9a-fA-F]+);', css_content)))
fonts = list(set(re.findall(r'font-family:\s*([^;\}]+)', css_content)))
bg_colors = list(set(re.findall(r'background-color:\s*(#[0-9a-fA-F]+)', css_content)))
hard_colors = list(set(re.findall(r'color:\s*(#[0-9a-fA-F]+)', css_content)))
borders = list(set(re.findall(r'border-radius:\s*([^;\}]+)', css_content)))

out = f"Colors (Hex): {colors[:20]}\n"
out += f"Fonts: {fonts[:15]}\n"
out += f"Bg Colors: {bg_colors[:15]}\n"
out += f"Text Colors: {hard_colors[:15]}\n"
out += f"Border Radius: {borders[:10]}\n"

with open('scrape_result.txt', 'w', encoding='utf-8') as f:
    f.write(out)
