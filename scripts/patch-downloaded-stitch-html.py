#!/usr/bin/env python3
import json, pathlib, subprocess, re
out=pathlib.Path('/Users/hzh/projects/freelancer-reply/stitch-output')
# Apply known Stitch edit operations locally as a fallback artifact, because edit_screens updated the Stitch project in-place but did not return new downloadable screens.
repls={
 'home-mobile.html': [
   ('Unlimited generations','Higher monthly limits (planned)'),
   ('Custom context injection','Saved client snippets (planned)'),
   ('Gmail/Outlook integration','Gmail/Outlook integration (planned)'),
 ],
 'tool-mobile.html': [
   ('You\'ve used all 3 free generations for today. Upgrade to Pro for unlimited access and custom tone saving.', 'You\'ve used all 3 free generations for today. Come back tomorrow or join the Pro waitlist for higher limits when Pro becomes available.'),
 ]
}
for name, pairs in repls.items():
    p=out/name
    text=p.read_text()
    for old,new in pairs:
        text=text.replace(old,new)
    patched=out/(p.stem+'-compliance-patched.html')
    patched.write_text(text)
    print(patched)
