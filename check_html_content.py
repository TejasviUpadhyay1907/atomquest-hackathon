import requests

r = requests.get('https://atomquest-frontend.vercel.app', timeout=20)
html = r.text

print('Checking for new content...')
print('Has "Login to your account":', 'Login to your account' in html)
print('Has email input:', 'type="email"' in html)
print('Has password input:', 'type="password"' in html)
print('Has button:', '<button' in html)
print('Has nav:', '<nav' in html)
print()
print('Last-Modified:', r.headers.get('Last-Modified'))
print('Etag:', r.headers.get('Etag'))
print()
print('Root div content (first 1000 chars):')
import re
root_match = re.search(r'<div id="root">(.*?)</div>', html, re.DOTALL)
if root_match:
    print(root_match.group(1)[:1000])
