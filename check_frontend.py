import requests
import re

r = requests.get('https://atomquest-frontend.vercel.app', timeout=20)
print('Status:', r.status_code)
html = r.text
print('HTML snippet:')
print(html[:800])
print()

css = re.findall(r'href=["\']([^"\']+\.css)', html)
js = re.findall(r'src=["\']([^"\']+\.js)', html)
print('CSS files:', css)
print('JS files:', js)

print()
print('Security Headers:')
for k, v in r.headers.items():
    print(f'  {k}: {v}')
