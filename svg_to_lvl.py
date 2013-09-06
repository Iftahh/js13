'''generate level from SVG'''
import sys
import re

transform = re.compile(r'''transform="matrix\((?P<xs>[^,]+),(?P<xk>[^,]+),(?P<yk>[^,]+),(?P<ys>[^,]+),(?P<xt>[^,]+),(?P<yt>[^\)]+)\)"''')
translate = re.compile(r'''transform="translate\((?P<xt>[^,]+),(?P<yt>[^\)]+)\)"''')
#arc_re = re.compile(r'''<path sodipodi:type="arc" style="fill:#(?P<color>[0-9a-f]+)[^"]*" id="(?P<id>[^"]+)" sodipodi:cx="(?P<x>[^"]+)" sodipodi:cy="(?P<y>[^"]+)" (?P<leftover>[^>]+)>''')
arc_re = re.compile(r'''<ellipse .*?id="(?P<id>[^"]+)" .*?cy="(?P<y>[^"]+)" cx="(?P<x>[^"]+)" .*?fill="#(?P<color>[0-9a-f]+)"(?P<leftover>[^>]+)>''')
#rect_re = re.compile(r'''<rect style="fill:#(?P<color>[0-9a-f]+)[^"]*" id="(?P<id>[^"]+)" width="(?P<w>[^"]+)" height="(?P<h>[^"]+)" x="(?P<x>[^"]+)" y="(?P<y>[^"]+)"(?P<leftover>[^>]+)>''')
rect_re = re.compile(r'''<rect .*?id="(?P<id>[^"]+)" .*?height="(?P<h>[^"]+)" width="(?P<w>[^"]+)" y="(?P<y>[^"]+)" x="(?P<x>[^"]+)" .*?fill="#(?P<color>[0-9a-f]+)"(?P<leftover>[^>]+)>''')
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
    setGlobal(Y=_y)
    setGlobal(X="{:.0f}".format(float(x)))
    setGlobal(Z="{:.0f}".format(fixY(y,h)))
    setGlobal(W="{:.0f}".format(float(w)))
    setGlobal(H="{:.0f}".format(float(h)))
    return "addCube(); /* Platform ID: {} */".format( id)

def to_coins(id, x,y):
    setGlobal(Y="IPY")
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
    if rect.get('color') in ['7fff00', '7f3f00']: #'550000':
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


jsGlobals = {}
_y = 0
def setGlobal(**kwargs):
    for k,v in kwargs.items():
        if jsGlobals.get(k) == v:
            continue
        jsGlobals[k]=v
        print "{}={:4}; ".format(k,v),


print "PY=IPY=50;Y=0; BW=27;BC=BBC;DR=brickDraw;B=0xfff;D=100;\n"
fname = sys.argv[1]




for line in open(fname):
    #print line
    if "<title>Back</title>" in line:
        print "/****  Back ****/"
        _y = 90
        setGlobal(Y=90, D=10)
    if "<title>Main</title>" in line:
        print "/***** Main ****/"
        _y=0  
        setGlobal(Y=0, D=100)
    if "<title>Front (hiding)</title>" in line:
        _y=0
        print "/***** FRONT *****/"
        setGlobal(Y=0, D=10)
    scanner = rect_re.scanner(line)
    rect = scanner.search()
    while rect:
        rect= rect.groupdict()
        t = transform.search(rect.get('leftover', '')) or translate.search(rect.get('leftover',''))
        if t:
            applyTransform(rect, t.groupdict())
        del rect['leftover']
        process_rect(rect)
        rect = scanner.search()

    scanner  = arc_re.scanner(line)
    arc = scanner.search()
    while arc:
        setGlobal(H=10)
        arc = arc.groupdict()
        t = transform.search(arc.get('leftover', '')) or translate.search(arc.get('leftover',''))
        if t:
            applyTransform(arc, t.groupdict())
        del arc['leftover']
        process_arc(arc)
        arc = scanner.search()



#for platform in platform_re.findall(txt):
#    print to_platform(*platform)
#for coin in coins_re.findall(txt):
#    print to_coins(*coin)
    
