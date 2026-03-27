import os, re
for r, d, f in os.walk('apps'):
    if 'apps.py' in f:
        p = os.path.join(r, 'apps.py')
        c = open(p).read()
        if not 'apps.' in c:
            c = re.sub(r"name = '([^']+)'", r"name = 'apps.\g<1>'", c)
            open(p, 'w').write(c)
