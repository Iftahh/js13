
var DC = document
var C = DC.getElementById("c")
var width = C.width; // todo: hard code 800x600 ?
var height = C.height;
var FdC = C.getContext("2d")
var C=FdC
var BgC = DC.getElementById("b").getContext("2d")
var rnd = Math.random
var abs = Math.abs
var min = Math.min
var max = Math.max
var cos= Math.cos
var round = Math.round
var rq = requestAnimationFrame
var floor = Math.floor
var OA = 255 // opaque alpha
var PI = Math.PI
var TPI = 2*PI

var nrnd = function(a,b) { return a+(b-a)*rnd()}
var irnd = function(a,b) { return nrnd(a,b)<<0 }

var range = function(a,b,c) { // max int, iterator, increment      - note uses global "i"  !!!!
    c = c || 1;
    for (i=0; i<a; i += c)
        b()
}
var brrange = function(a,b,c) { // breaking range: max int, iterator, increment      - note uses global "i"  !!!!
    c = c || 1;
    for (i=0; i<a; i += c) {
        var res = b()
        if (res) return res;
    }
}
var each = function(a,b) { // collection, iterator     -  note uses global "i" and "$" !!!
    range(a.length, function() {$=a[i]; b();})
}
var breach = function(a,b) { // breaking each: collection, iterator     -  note uses global "i" and "$" !!!
    return brrange(a.length, function() {$=a[i]; return b();})
}


var OffsetX = OffsetY = 0;
var trns = function(a,b,c,d,e,f) { C.setTransform(a,b,c,d,e-OffsetX,f-OffsetY) }  // hscale,hskew,vskew,vscale,x,y


// these aren't consts but are using to pass parameters (made global to save space on repeating values)
// TODO: this optimization may be more harmful than worth the saving
// X,Y,Z,   W,H,D
// B - borders
// BC - border color
// BW - brick width
// DR - draw

//var log = function(){}
var log = function(x) { console.log(x) }
