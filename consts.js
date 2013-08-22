
DC = document
C = DC.getElementById('c')
width = C.width;
height = C.height;
C = C.getContext('2d')
rnd = Math.random
abs = Math.abs
min = Math.min
cos= Math.cos
rq = requestAnimationFrame
floor = Math.floor
OA = 255 // opaque alpha
PI = Math.PI
TPI = 2*PI

trns = function(hsc,hsk,vsk,vsc,x,y) { C.setTransform(hsc,hsk,vsk,vsc,x,y) }
nrnd = function(a,b) { return a+(b-a)*rnd()}
irnd = function(a,b) { return nrnd(a,b)<<0 }



// these aren't consts but are using to pass parameters (made global to save space on repeating values)
// TODO: this optimization may be more harmful than worth the saving
// X,Y,Z,   W,H,D
// B - borders
// BC - border color
// BW - brick width
// DR - draw
