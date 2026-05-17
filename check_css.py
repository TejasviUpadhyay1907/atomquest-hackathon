import requests

css_url = 'https://atomquest-frontend.vercel.app/assets/index-_SjLtGlq.css'
r = requests.get(css_url, timeout=20)
print('CSS Status:', r.status_code)
css = r.text
print('CSS length:', len(css))
print()

# Check for features
checks = {
    'flex': 'flex' in css.lower(),
    'grid': 'grid' in css.lower(),
    '@media': '@media' in css.lower(),
    'animation': 'animation' in css.lower(),
    'var(': 'var(' in css.lower(),
    '--': '--' in css,
    'transition': 'transition' in css.lower(),
}

for k, v in checks.items():
    print(f'{k}: {"FOUND" if v else "NOT FOUND"}')

print()
print('First 500 chars of CSS:')
print(css[:500])
