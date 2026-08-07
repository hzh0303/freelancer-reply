#!/usr/bin/env python3
import json, pathlib, subprocess, re
out = pathlib.Path('/Users/hzh/projects/freelancer-reply/stitch-output')
summary_path = out / 'summary.json'
summary = json.loads(summary_path.read_text())

def extract_screens(resp):
    records=[]
    for comp in resp.get('structuredContent',{}).get('outputComponents',[]):
        for s in comp.get('design',{}).get('screens',[]):
            records.append({
                'screenName': s.get('name'),
                'screenId': s.get('id'),
                'width': s.get('width'),
                'height': s.get('height'),
                'htmlUrl': (s.get('htmlCode') or {}).get('downloadUrl'),
                'screenshotUrl': (s.get('screenshot') or {}).get('downloadUrl'),
                'localHtml': None,
                'localScreenshot': None,
            })
    return records

# Add generator-states from existing response if missing
if not any(x.get('slug') == 'generator-states' for x in summary['screens']):
    p = out / 'generator-states.response.json'
    if p.exists():
        resp = json.loads(p.read_text())
        records = extract_screens(resp)
        summary['screens'].append({'slug':'generator-states','name':'Generator States and Modals','deviceType':'DESKTOP','ok': bool(records), 'records': records})

# Download all assets with curl, because node fetch may fail in local env
for screen in summary['screens']:
    for idx, rec in enumerate(screen.get('records', []), 1):
        stem = re.sub(r'[^a-zA-Z0-9._-]+','-', screen['slug']).lower()
        if len(screen['records']) > 1:
            stem += f'-{idx}'
        if rec.get('htmlUrl'):
            html = out / f'{stem}.html'
            if not html.exists() or html.stat().st_size == 0:
                subprocess.run(['curl','-L','--fail','--max-time','90','-o',str(html),rec['htmlUrl']], check=False)
            if html.exists() and html.stat().st_size > 0:
                rec['localHtml'] = str(html)
        if rec.get('screenshotUrl'):
            png = out / f'{stem}.png'
            if not png.exists() or png.stat().st_size == 0:
                subprocess.run(['curl','-L','--fail','--max-time','90','-o',str(png),rec['screenshotUrl']], check=False)
            if png.exists() and png.stat().st_size > 0:
                rec['localScreenshot'] = str(png)

summary_path.write_text(json.dumps(summary, indent=2, ensure_ascii=False))
print(json.dumps({
    'projectId': summary['projectId'],
    'screens': len(summary['screens']),
    'ok': sum(1 for s in summary['screens'] if s.get('ok')),
    'screenshots': sum(1 for s in summary['screens'] for r in s.get('records',[]) if r.get('localScreenshot')),
    'html': sum(1 for s in summary['screens'] for r in s.get('records',[]) if r.get('localHtml')),
}, indent=2))
