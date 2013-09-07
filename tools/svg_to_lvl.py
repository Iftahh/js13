'''generate level from SVG'''
import sys
import re

transform = re.compile(r'''transform="matrix\((?P<xs>[^,]+),(?P<xk>[^,]+),(?P<yk>[^,]+),(?P<ys>[^,]+),(?P<xt>[^,]+),(?P<yt>[^\)]+)\)"''')
translate = re.compile(r'''transform="translate\((?P<xt>[^,]+),(?P<yt>[^\)]+)\)"''')
#arc_re = re.compile(r'''<path sodipodi:type="arc" style="fill:#(?P<color>[0-9a-f]+)[^"]*" id="(?P<id>[^"]+)" sodipodi:cx="(?P<x>[^"]+)" sodipodi:cy="(?P<y>[^"]+)" (?P<leftover>[^>]+)>''')

ellipse_re = re.compile(r'''<ellipse (?P<attributes>[^>]+)>''')

id_re = re.compile(r'''\bid="(?P<id>[^"]+)"''')
cy_re = re.compile(r'''\bcy="(?P<y>[^"]+)"''')
cx_re = re.compile(r'''\bcx="(?P<x>[^"]+)"''')
fill_re = re.compile(r'''\bfill="#(?P<color>[0-9a-f]+)"''')

#rect_re = re.compile(r'''<rect style="fill:#(?P<color>[0-9a-f]+)[^"]*" id="(?P<id>[^"]+)" width="(?P<w>[^"]+)" height="(?P<h>[^"]+)" x="(?P<x>[^"]+)" y="(?P<y>[^"]+)"(?P<leftover>[^>]+)>''')
rect_re = re.compile(r'''<rect (?P<attributes>[^>]+)>''')
height_re = re.compile(r'''\bheight="(?P<h>[^"]+)"''')
width_re = re.compile(r'''\bwidth="(?P<w>[^"]+)"''')
y_re = re.compile(r'''\by="(?P<y>[^"]+)"''')
x_re = re.compile(r'''\bx="(?P<x>[^"]+)"''')



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

IPX = 0
IPY = 50
IPZ= 0
def to_player(id, x,y):
    print "/* Player :  ID: {:6}  */   ".format(id),
    global IPX, IPZ
    IPX = float(x)
    IPZ = flipY(y)
    print "IPX={:.0f};IPZ={:.0f};".format(IPX, IPZ, id)

platform_overrides = {
    "svg_3": {"B":"0xffb"},
    "svg_10": {"B":"0x0ea"},
    "*": {"B":"0xfff"}
}

def to_platform(id,color,w,h,x,y):
    print "/* Platform ID: {:6} */     ".format( id),
    if color in ['7fff00']:
        setGlobal(DR="textureDraw")
    elif color in ['7f3f00']: #'550000':
        setGlobal(DR="brickDraw")
    else:
        print "\n/* >>>>>>>>>>>  Unknown rect: {} */".format(rect)
        return
    if platform_overrides.get(id):
        setGlobal(**platform_overrides[id])
    else:
        setGlobal(**platform_overrides['*'])
    setGlobal(Y=_y)
    setGlobal(X="{:.0f}".format(float(x)))
    setGlobal(Z="{:.0f}".format(fixY(y,h)))
    setGlobal(W="{:.0f}".format(float(w)))
    setGlobal(H="{:.0f}".format(float(h)))
    print "addCube();"

def to_coins(id, x,y):
    print "/* Coin ID: {:6}   */       ".format(id),
    jsGlobals["Y"] = IPY
    jsGlobals["Z"] = flipY(y)
    jsGlobals["X"] = float(x)
    jsGlobals["H"] = 10 # must be in sync with coins.js
    print "addCoin({:.0f},{:.0f}); ".format(float(x),flipY(y))

def to_enemy(id, x,y):
    print "/* Enemy ID: {:6}   */      ".format(id),
    jsGlobals["Y"] = IPY
    jsGlobals["Z"] = flipY(y)
    jsGlobals["X"] = float(x)
    jsGlobals["H"] = 20 # must be in sync with enemy.js
    print "addEnemy({:.0f},{:.0f}); ".format(float(x),flipY(y))

def process_ellipse(arc):
    color = arc.get('color')
    del arc['color']
    if color== '0000ff':
        to_player(**arc)
    elif color == 'ff7f00':
        to_enemy(**arc)
    elif color  == 'ffff00':
        to_coins(**arc)
    else:
        print "/* >>>>>>>>>>>>>>>>  unknown arc: {} */".format(arc)

  

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


print "IPY={};Y=0; BW=27;BC=BBC;DR=brickDraw;D=100;\n".format(IPY)
fname = sys.argv[1]




for line in open(fname):
    #print line
    if "<title>Back</title>" in line:
        print "/****  Back ****/"
        _y = 90
        setGlobal(Y=90, D=10)
        print ""
    if "<title>Main</title>" in line:
        print "/***** Main ****/"
        _y=0  
        setGlobal(Y=0, D=100)
        print ""
    if "<title>Front (hiding)</title>" in line:
        _y=0
        print "/***** FRONT *****/"
        setGlobal(Y=0, D=10)
        print ""

    scanner = rect_re.scanner(line)
    rect = scanner.search()
    while rect:
        attributes= rect.groups()[0]
        rect = {
            "id": id_re.findall(attributes)[0],
            "y": y_re.findall(attributes)[0],
            "x": x_re.findall(attributes)[0],
            "color": fill_re.findall(attributes)[0],
            "w": width_re.findall(attributes)[0],
            "h": height_re.findall(attributes)[0],
        }
           
        t = transform.search(attributes) or translate.search(attributes)
        if t:
            applyTransform(rect, t.groupdict())
        to_platform(**rect)
        rect = scanner.search()

    scanner  = ellipse_re.scanner(line)
    ellipse = scanner.search()
    while ellipse:
        attributes= ellipse.groups()[0]
        ellipse = {
            "id": id_re.findall(attributes)[0],
            "y": cy_re.findall(attributes)[0],
            "x": cx_re.findall(attributes)[0],
            "color": fill_re.findall(attributes)[0]
        }
        
        t = transform.search(attributes) or translate.search(attributes)
        if t:
            applyTransform(ellipse, t.groupdict())
        process_ellipse(ellipse)
        ellipse = scanner.search()



#for platform in platform_re.findall(txt):
#    print to_platform(*platform)
#for coin in coins_re.findall(txt):
#    print to_coins(*coin)
    
