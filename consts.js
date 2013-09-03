
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
round = Math.round
rq = requestAnimationFrame
floor = Math.floor
OA = 255 // opaque alpha
PI = Math.PI
TPI = 2*PI

nrnd = function(a,b) { return a+(b-a)*rnd()}
irnd = function(a,b) { return nrnd(a,b)<<0 }

range = function(a,b,c) { // max int, iterator, increment      - note uses global "i"  !!!!
    c = c || 1;
    for (i=0; i<a; i += c)
        b()
}
brrange = function(a,b,c) { // breaking range: max int, iterator, increment      - note uses global "i"  !!!!
    c = c || 1;
    for (i=0; i<a; i += c) {
        var res = b()
        if (res) return res;
    }
}
each = function(a,b) { // collection, iterator     -  note uses global "i" and "$" !!!
    range(a.length, function() {$=a[i]; b();})
}
breach = function(a,b) { // breaking each: collection, iterator     -  note uses global "i" and "$" !!!
    return brrange(a.length, function() {$=a[i]; return b();})
}


OffsetX = OffsetY = 0;
trns = function(a,b,c,d,e,f) { C.setTransform(a,b,c,d,e-OffsetX,f-OffsetY) }  // hscale,hskew,vskew,vscale,x,y


// these aren't consts but are using to pass parameters (made global to save space on repeating values)
// TODO: this optimization may be more harmful than worth the saving
// X,Y,Z,   W,H,D
// B - borders
// BC - border color
// BW - brick width
// DR - draw
