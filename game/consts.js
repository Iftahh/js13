DEBUG=true  // TODO: remove all debug from code

if (DEBUG) {
    onerror = function (message, url, line) {
        alert(message, url, line);
    }
}

var DC = document

var each = function(collection, iterFu) {
    for (var i=0; i<collection.length; i++) {
        var $=collection[i];
        iterFu($,i);
    }
}

var canvases = [];
each(['b','c','d'], function($) { canvases.push(DC.getElementById($))})
var width = canvases[0].width; // todo: hard code 800x600 ?
var height = canvases[0].height;
var FdC = canvases[1].getContext("2d")
var C=FdC // current canvas to draw to
var BgC = canvases[0].getContext("2d")
var Tch = canvases[2].getContext("2d")
var rnd = Math.random
var abs = Math.abs
var min = Math.min
var max = Math.max
var cos= Math.cos
var round = Math.round
var OA = 255 // opaque alpha
var PI = Math.PI
var TPI = 2*PI


var coins = [];
var sprites = [];

var joystick =0;

BgC.fillStyle="#222"
BgC.fillRect(0,0,width,height)


var nrnd = function(a,b) { return a+(b-a)*rnd()}
var irnd = function(a,b) { return nrnd(a,b)<<0 }

var range = function(maxInt,iterFu,increment) {
    increment = increment || 1;
    for (var i=0; i<maxInt; i += increment)
        iterFu(i)
}
var brrange = function(maxInt,iterFu,increment) {
    increment = increment || 1;
    for (var i=0; i<maxInt; i += increment) {
        var res = iterFu(i)
        if (res) return res;
    }
}
var each = function(collection, iterFu) {
    for (var i=0; i<collection.length; i++) {
        var $=collection[i];
        iterFu($,i);
    }
}
var breach = function(collection, iterFu) { // breaking each: collection, iterator     -  note uses global "i" and "$" !!!
    return brrange(collection.length, function(i) {var $=collection[i]; return iterFu($,i);})
}


var suffix = 'equestAnimationFrame';
var rq= window['r'+suffix] || window['mozR'+suffix] || window['webkitR'+suffix]
if (!rq) {
    var lastTime = 0;
    rq = function(callback) {
        var currTime = Date.now();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
            timeToCall);
        lastTime = currTime + timeToCall;
    }
}

var fcurCameraX, fcurCameraY; //  fcur-camera defines what is being viewed - needed to be float in order not to lock

var OffsetX = OffsetY = 0; //  is the integer round of fcur - needed to be int in order to avoid fuzzy drawimage for images
var trns = function(hscale,hskew,vskew,vscale,x,y) { C.setTransform(hscale,hskew,vskew,vscale,x-OffsetX,y-OffsetY) }  //


// render to canvas
var r2c=function (width, height, renderFunction) {
    var buffer = DC.createElement('canvas');
    buffer.width = width;
    buffer.height = height;
    renderFunction(buffer.getContext('2d'), buffer);
    buffer.draw = function(x,y,w,h) { C.drawImage(this, x,y,w,h) }
    return buffer;
}


// these aren't consts but are using to pass parameters (made global to save space on repeating values)
// TODO: this optimization may be more harmful than worth the saving
// Y  D
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

// shallow copy of array, and then update
var cloneUpdateArray = function($,D) {
    var res = []
    for (var i=0; i<$.length; i++) { // not using range, to allow cloning within range
        res[i]=$[i]
    }
    update(res, D)
    return res;
}


BW=27;BH=0;   // brick width and height (height=0 use .3*width
B=0xfff;
BC=BBC // border color

//var log = function(){}
var log = function(x) { if(!DEBUG) {alert("Forgot a log")} console.log(x) }
