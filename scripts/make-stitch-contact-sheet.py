#!/usr/bin/env python3
from PIL import Image, ImageOps, ImageDraw, ImageFont
import pathlib, json, math
out=pathlib.Path('/Users/hzh/projects/freelancer-reply/stitch-output')
summary=json.loads((out/'summary.json').read_text())
items=[]
for s in summary['screens']:
    for r in s.get('records',[]):
        p=r.get('localScreenshot')
        if p and pathlib.Path(p).exists():
            items.append((s['slug'], pathlib.Path(p)))
thumb_w, thumb_h = 320, 260
label_h=44
cols=3
rows=math.ceil(len(items)/cols)
sheet=Image.new('RGB',(cols*thumb_w, rows*(thumb_h+label_h)), '#F7F3EC')
d=ImageDraw.Draw(sheet)
try: font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 16)
except: font=None
for idx,(slug,p) in enumerate(items):
    img=Image.open(p).convert('RGB')
    img.thumbnail((thumb_w-24, thumb_h-24), Image.LANCZOS)
    x=(idx%cols)*thumb_w; y=(idx//cols)*(thumb_h+label_h)
    # card bg
    d.rounded_rectangle([x+8,y+8,x+thumb_w-8,y+thumb_h+label_h-8], radius=16, fill='#FFFEFA', outline='#DDE5DF')
    ix=x+(thumb_w-img.width)//2; iy=y+16
    sheet.paste(img,(ix,iy))
    d.text((x+16,y+thumb_h+8), slug, fill='#17211C', font=font)
sheet_path=out/'contact-sheet.png'
sheet.save(sheet_path)
print(sheet_path)
