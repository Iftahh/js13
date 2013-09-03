'''generate level from SVG'''
import sys
import re

transform = re.compile(r'''transform="matrix\((?P<xs>[^,]+),(?P<xk>[^,]+),(?P<yk>[^,]+),(?P<ys>[^,]+),(?P<xt>[^,]+),(?P<yt>[^\)]+)\)"''')
arc_re = re.compile(r'''<path sodipodi:type="arc" style="fill:#(?P<color>[0-9a-f]+)[^"]*" id="(?P<id>[^"]+)" sodipodi:cx="(?P<x>[^"]+)" sodipodi:cy="(?P<y>[^"]+)" (?P<leftover>[^>]+)>''')
#'<ellipse style="fill: #0000ff" cx="([^"]+)" cy="([^"]+)"[^>]+>''')
rect_re = re.compile(r'''<rect style="fill:#(?P<color>[0-9a-f]+)[^"]*" id="(?P<id>[^"]+)" width="(?P<w>[^"]+)" height="(?P<h>[^"]+)" x="(?P<x>[^"]+)" y="(?P<y>[^"]+)"(?P<leftover>[^>]+)>''')
#coins_re = re.compile('<path sodipodi:type="arc" style="fill:#ffff00" id="(?P<id>[^"]+)" sodipodi:cx="(?P<x>[^"]+)" sodipodi:cy="(?P<y>[^"]+)"[^>]+>')
#'<ellipse style="fill: #ffff00" cx="([^"]+)" cy="([^"]+)"[^>]+/>')
#heart_re = re.compile('<path style="[^"]*stroke-dasharray: 4;[^"]*" d="[^"]*"/>')


if len(sys.argv) < 2:
    print "missing argument svg filename"
    sys.exit()

def flipY(y):
    return 600-float(y) #-1*float(y)
def fixY(y,h):
    return flipY(y)-float(h)

def to_player(id, x,y):
    return "IPX=PX={:.0f};IPZ=PZ={:.0f}; /* ID: {} */".format(float(x),flipY(y), id)

def to_platform(id,w,h,x,y):
    return "X={:.0f};Z={:.0f};W={:.0f};H={:.0f};addSprite(); /* Platform ID: {} */".format(float(x),fixY(y,h),float(w),float(h), id)

def to_coins(id, x,y):
    return "addCoin({:.0f},{:.0f}); /*  coin ID: {} */".format(float(x),flipY(y), id)

def process_arc(arc):
    if arc.get('color')== '0000ff':
        del arc['color']
        print to_player(**arc)
    elif arc.get('color') == 'ffff00':
        del arc['color']
        print to_coins(**arc)
    else:
        print "/* unknown arc: {} */".format(arc)

def process_rect(rect):
    if rect.get('color')== '550000':
        del rect['color']
        #rect['h'] = 10
        print to_platform(**rect)
    else:
        print "/* Unknown rect: {} */".format(rect)

def applyTransform(d, t):
    x = float(d.get('x',0))
    y = float(d.get('y',0))
    d['x'] = x*float(t.get('xs',1)) + float(t.get('xt',0))
    d['y'] = y*float(t.get('ys',1)) + float(t.get('yt',0))
    if 'w' in d:
        d['w'] = d['w']*float(t.get('xs',1)) 
    if 'h' in d:
        d['h'] = d['h']*float(t.get('ys',1)) 

print "PY=IPY=50;Y=0; BW=27;BC=BBC;DR=texturecube;B=0x1ff;D=100;\n"
fname = sys.argv[1]
txt = open(fname).read().replace("\n", " ")
txt = ' '.join(filter(bool, txt.split(" ")))
#print txt

scanner = rect_re.scanner(txt)
rect = scanner.search()
while rect:
    rect= rect.groupdict()
    t = transform.search(rect.get('leftover', ''))
    if t:
        applyTransform(rect, t.groupdict())
    del rect['leftover']
    process_rect(rect)
    rect = scanner.search()

print "H=10;"
scanner  = arc_re.scanner(txt)
arc = scanner.search()
while arc:
    arc = arc.groupdict()
    t = transform.search(arc.get('leftover', ''))
    if t:
        applyTransform(arc, t.groupdict())
    del arc['leftover']
    process_arc(arc)
    arc = scanner.search()



#for platform in platform_re.findall(txt):
#    print to_platform(*platform)
#for coin in coins_re.findall(txt):
#    print to_coins(*coin)
    
