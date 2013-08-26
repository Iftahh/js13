
DC = document
C = DC.getElementById("c")
width = C.width; // todo: hard code 800x600 ?
height = C.height;
FdC = C.getContext("2d")
C=FdC
BgC = DC.getElementById("b").getContext("2d")
rnd = Math.random
abs = Math.abs
min = Math.min
max = Math.max
cos= Math.cos
rq = requestAnimationFrame
floor = Math.floor
OA = 255 // opaque alpha
PI = Math.PI
TPI = 2*PI

trns = function(a,b,c,d,e,f) { C.setTransform(a,b,c,d,e,f) }  // hscale,hskew,vskew,vscale,x,y
nrnd = function(a,b) { return a+(b-a)*rnd()}
irnd = function(a,b) { return nrnd(a,b)<<0 }

each = function(a,b) { // collection, iterator     -  note uses global "i" and "$" !!!
    for (i=0; i< a.length; i++) {
        $ = a[i];
        var res = b()
        if (res) return res
    }
}
range = function(a,b) { // max int, iterator      - note uses global "i"  !!!!
    for (i=0; i<a; i++)
        b()
}

// these aren't consts but are using to pass parameters (made global to save space on repeating values)
// TODO: this optimization may be more harmful than worth the saving
// X,Y,Z,   W,H,D
// B - borders
// BC - border color
// BW - brick width
// DR - draw
