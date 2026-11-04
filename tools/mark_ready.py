"""Flag todo:true bei fertigen Fotos entfernen. Aufruf: python3 tools/mark_ready.py e1 s6 ..."""
import re, sys
for p in ['components/Interludes.tsx', 'lib/dishes.ts']:
    s = open(p).read()
    for k in sys.argv[1:]:
        s = re.sub(r'(\{ img: "%s", [^\n]*?), todo: true( \},)' % k, r'\1\2', s)
    open(p, 'w').write(s)
