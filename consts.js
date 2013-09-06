
var DC = document
var canvasC = DC.getElementById("c")
var width = canvasC.width; // todo: hard code 800x600 ?
var height = canvasC.height;
var FdC = canvasC.getContext("2d")
var C=FdC
var canvasB = DC.getElementById("b")
var BgC = canvasB.getContext("2d")
var rnd = Math.random
var abs = Math.abs
var min = Math.min
var max = Math.max
var cos= Math.cos
var round = Math.round
var rq = requestAnimationFrame
var OA = 255 // opaque alpha
var PI = Math.PI
var TPI = 2*PI

onresize = function() {
    var offsetY = ((DC.height - height)/2)+"px"
    var offsetX = ((DC.width - width)/2)+"px"
    canvasC.style.top = offsetY;
    canvasC.style.left = offsetX;
    canvasB.style.top = offsetY;
    canvasB.style.left = offsetX;
}
onresize()

var nrnd = function(a,b) { return a+(b-a)*rnd()}
var irnd = function(a,b) { return nrnd(a,b)<<0 }

var range = function(maxInt,iterFu,increment) { //       - note uses global "i"  !!!!
    increment = increment || 1;
    for (i=0; i<maxInt; i += increment)
        iterFu()
}
var brrange = function(maxInt,iterFu,increment) { //     - note uses global "i"  !!!!
    increment = increment || 1;
    for (i=0; i<maxInt; i += increment) {
        var res = iterFu()
        if (res) return res;
    }
}
var each = function(collection, iterFu) { // collection, iterator     -  note uses global "i" and "$" !!!
    range(collection.length, function() {$=collection[i]; iterFu();})
}
var breach = function(collection, iterFu) { // breaking each: collection, iterator     -  note uses global "i" and "$" !!!
    return brrange(collection.length, function() {$=collection[i]; return iterFu();})
}



var fcurCameraX, fcurCameraY; //  fcur-camera defines what is being viewed - needed to be float in order not to lock

var OffsetX = OffsetY = 0; //  is the integer round of fcur - needed to be int in order to avoid fuzzy drawimage for images
var trns = function(hscale,hskew,vskew,vscale,x,y) { C.setTransform(hscale,hskew,vskew,vscale,x-OffsetX,y-OffsetY) }  //


// these aren't consts but are using to pass parameters (made global to save space on repeating values)
// TODO: this optimization may be more harmful than worth the saving
// X,Y,Z,   W,H,D
// B - borders
// BC - border color
// BW - brick width
// DR - draw

var RGB=function(a,b,c,d) { return "rgba("+a+","+b+","+c+","+(d||1)+")"}
var BBC = RGB(15,15,15,.3) // block border color


// update dictionary $ with key/values from D
var update = function($,D) {
    for (k in D) {
        $[k] = D[k];
    }
}
// shallow copy of object, and then update
var cloneUpdateObj = function($,D) {
    var res = {}
    for (k in $) {
        res[k]=$[k]
    }
    update(res, D)
    return res;
}


BW=27;BH=0;   // brick width and height (height=0 use .3*width
B=0xfff;
BC=BBC // border color

//var log = function(){}
var log = function(x) { console.log(x) }
