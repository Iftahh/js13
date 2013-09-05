/****
 * TODO: shrink by http://iteral.com/jscrush/  or https://github.com/cowboy/javascript-packify
 *
 * make all function params the same  (a,b,c,d,e...)
 * for non-recursive functions  use globals instead of locals  (remove "var ")  - make sure names do not collide
 * use globals instead of function parameters?   x=4,y=5, addSprite()  instead of addSprite(4,5)  ?
 * remove seed - all pure random :(
 * shorten canvas functions?  c.lg = c.createLinearGradient
 *
 * make a script that changes all functions to be like this
 * <name>=function(a,b,c,d,e,f,g,h){
 * because the "=function(a,b,c,d,e,f,g,h){" will be shortened by jscrush to one letter
 */


// render to canvas
var r2c=function (width, height, renderFunction) {
    var buffer = DC.createElement('canvas');
    buffer.width = width;
    buffer.height = height;
    renderFunction(buffer.getContext('2d'), buffer);
    buffer.draw = function(x,y,w,h) { C.drawImage(this, x,y,w,h) }
    return buffer;
}


var setPixel=function (d,x, r, g, b, a) {
    d[x] = r;
    d[x+1] = g;
    d[x+2] = b;
    d[x+3] = a;
}

var noise=function(c,w,h,r1,dr,g1,dg,b1,db) { //random noise texture
    var imgData=c.createImageData(w,h);
    var d = imgData.data;
    for (var i=0;i<d.length;i+=4)
        setPixel(d,i,r1+rnd()*dr,g1+rnd()*dg,b1+rnd()*db,OA)
    c.putImageData(imgData,0,0);
}

// brick texture at of width and height,  bw = brick width, nr= num rows
var brick=function (w,h,c1,c2) {
    C.fillStyle = c1
    C.fillRect(0,0,w,h)
    C.strokeStyle = c2;
    row=0
    C.lineWidth = bh/5
    y0=0;y1=bh
    C.beginPath()
    while(y1<=h) {
        row++;
        C.moveTo(0, y1)
        C.lineTo(w,y1)
        x0 = row & 1 ? bw: bw/2;
        while(x0<w) {
            C.moveTo(x0,y0)
            C.lineTo(x0,y1)
            x0 += bw
        }
        y0 = y1
        y1 += bh
    }
    C.stroke()
}





var D=20
var TT= r2c(D,D, function(c) { noise(c, D,D, 80,20, 180,40, 80,40)})
var TF= r2c(D,D, function(c) { noise(c, D,D, 120,20, 110,20, 40,30)})
var TR= r2c(D,D, function(c) { noise(c, D,D, 140,25, 120,25, 50,40)})
var toPattern = function(texture) {
    var r = C.createPattern(r2c(3*D,3*D, function(c) {c.drawImage(texture,0,0,3*D,3*D)}), 'repeat');
    r.draw = function(x,y,w,h) {
        C.fillStyle= this;
        C.fillRect(x,y,w,h)
    }
    return r;
}
var PT = toPattern(TT)
var PF = toPattern(TF)
var PR = toPattern(TR)

var CameraX = 0;
var CameraY = 0;

// toscreen
var ts = function () { SX=X+Y/2, SY=height-Y/2-H-Z}

var tree = function(x,y,z, w,h1,h2) {
    X=x,Y=y,Z=z,H=h1
    ts()
    grd = C.createLinearGradient(SX,SY,SX+w,SY)
    grd.addColorStop(0, '#752');
    grd.addColorStop(1, '#964');
    C.fillStyle=grd
    C.fillRect(SX,SY, w,h1)
    SX+=w/2

    range(30+h2, function() {
        C.fillStyle=RGB(irnd(25,30),irnd(170,210),irnd(55,70),0.7)
        C.beginPath()
        Y=rnd()
        C.arc(SX+2*w*Y*nrnd(-1,1),SY-h2+Y*(h2+5), 5+Y*rnd()*9,0,TPI)
        C.fill()
    })
}

var backSprites = []; // background sprites - drawn in the order inserted
var sprites = [];   // sprites that should be sorted (TODO)
var frontSprites = [];  // sprites drawn on top - in order inserted -  and become transparent if player behind them
var csprites = backSprites; // current sprites - where the addSprite will insert
var CL = []  // collision when moving left (X--)
var CR = []  // collision when moving right (X++)
var CD = []  // collision when moving down (Z--)
var CU = []  // collision when moving up (Z++)
var CF = [] // when moving front (Y--)
var CB = [] // when moving back (Y++)

var drawFrontSprites = function() {  // container
    each(frontSprites, function() {
        x= $.sx, y= $.sy,w= $.w,h= $.h,d= $.d, b= $.br;
        if (x-100 < PSX && x+100+w+d/2 > PSX  && y-100<PSY && y+100+h+d/2> PSY) {
            C.globalAlpha = .3  // TODO: make alpha based on distance from player
        }
        else {
            C.globalAlpha = 1
        }
        $.draw();
    })
    C.globalAlpha = 1
}

// using globals
// X,Y,Z,   W,H,D
// B - borders
// BC - border color
// BW - brick width
// DR - draw
var addSprite = function() {  // container
    addNonBlockSprite()
    // add blocking data
    if (D>10 && H>10) {
        CL.push({
            y:Y,z:Z,
            d:D, h:H, w:0,
            x:X
        })
        CR.push({
            y:Y,z:Z,
            d:D, h:H,w:0,
            x:X+W
        })
    }
    if (D>10 && W>10) {
        CD.push({
            x:X,y:Y,
            w:W, d:D, h:0,
            z:Z+H
        })
        CU.push({
            x:X,y:Y,
            w:W, d:D, h:0,
            z:Z
        })
    }
    if (H>10 && W>10) {
        CF.push({
            x:X,z:Z,
            w:W, h:H, d:0,
            y:Y+D
        })
        CB.push({
            x:X,z:Z,
            w:W, h:H, d:0,
            y:Y
        })
    }
}

var collide = function(x,y,z,r, C) {  // C is either CR/CL/CT/CF/etc..,   (x,y,z) is the bottom left front corner, r is the cube height/width/depth (same all)
    return breach(C, function() {
        // doing cube collision for simplicity - TODO: change to sphere collision
        if ((x+r >= $.x && x < $.x+$.w ) &&
            (y+r >= $.y && y < $.y+$.d) &&
            (z+r >= $.z && z < $.z+$.h )) {
            return $;
        }
    })
}


var findFloor = function(x,y,z) {
    // find floor below the point
    var maxPlane = {z:-10e9};
    each(CD, function() {
        if ($.z >maxPlane.z && // above the current maxPlane
            z >=$.z && // but below the player
            x >= $.x && x<$.x+$.w &&
            y >= $.y && y<$.y+$.d ) {
            maxPlane = $;
        }
    })
    return maxPlane;
}

// using globals
// X,Y,Z,   W,H,D
// B - borders
// BC - border color
// BW - brick width
// DR - draw
var addNonBlockSprite=function() {
    ts()
    csprites.push({
        x:X, // world x
        y:Y,
        z:Z,
        br:B,  // border flags
        bc:BC, // brick color
        bw:BW, // brick width

        tr:PR, // texture right
        tt:PT, // texture top
        tf:PF, // texture front

        sx:SX,     // screen x
        sy:SY,
        w:W, h:H, d:D,
        draw: DR
    })
}

var TBC1 = "#e86" // top brick color 1
var TBC2 = "#eda"
var FBC1="#d74" // front brick color
var FBC2="#dc8"
var RBC1="#b52"
var RBC2="#ba6"

var BORT=function() {
    if (b & 384) {
        C.strokeStyle = $.bc;
        C.beginPath();
        if (b&256) {
            C.moveTo(0,0)
            C.lineTo(0,d)
        }
        if (b&128) {
            C.moveTo(0,0)
            C.lineTo(w,0)
        }
        C.stroke()
    }
}

var BORF=function() {
    if (b & 15) {
        C.strokeStyle = $.bc;
        C.beginPath();
        if (b&4) {          // TODO: dry [4,0,0,w,0]  ?
            C.moveTo(0,0)
            C.lineTo(w,0)
        }
        if (b&2) {
            C.moveTo(w,0)
            C.lineTo(w,h)
        }
        if (b&1){
            C.moveTo(w,h)
            C.lineTo(0,h)
        }
        if (b&8){
            C.moveTo(0,h)
            C.lineTo(0,0)
        }
        C.stroke()
    }
}

var BORR=function() {
    if (b & 112) { // TODO: can reomve this if
        C.strokeStyle = $.bc;
        C.beginPath();
        if (b& 64) {
            C.moveTo(0,0)
            C.lineTo(d,0)
        }
        if (b& 32) {
            C.moveTo(d,0)
            C.lineTo(d,h)
        }
        if (b&16){
            C.moveTo(d,h)
            C.lineTo(0,h)
        }
//        if (b&128){
//            C.moveTo(0,h)
//            C.lineTo(0,0)
//        }
        C.stroke()
    }
}

var brickDraw=function() {
    //  Borders
    //      ___ 7 ____
    //    8/        6/|
    //    /         / |
    //   +--- 2 ---+  |5
    //   |         |  |
    //   3         1  /
    //   |         | /4
    //   +--- 0 ---+/
    bw= $.bw, bh=bw*.3
    // top
    trns(1, 0,-.5,.5,x+0.4 +.5*d,y-.5*d)
    brick(w, d, TBC1, TBC2);
    BORT()

    // front
    trns(1, 0,0,1, x,y)
    brick(w,h, FBC1, FBC2)
    BORF()
    // right
    trns(.5, -.5,0,1,x+w,y)
    brick(d,h,RBC1,RBC2)
    BORR()
}

var texturecube=function () {
    // front
    //y-=h/2;
    trns(1, 0,0,1, x,y)    // hscale,hskew,vskew,vscale,x,y
    $.tf.draw(0,0,w,h)
    //C.drawImage($.tf, 0,0, w,h);
    BORF()

//    if (p > 0) {
    // right
    p = .5
    trns(p, -p,0,1,x+w,y)
    $.tr.draw(0,0,d,h)
    //C.drawImage($.tr, 0,0, d,h);
    BORR()

    // top
    trns(1, 0,-p, p,x+.4 +p*d,y-p*d)
    $.tt.draw(0,0,w,d)
    BORT()

//    }
//    else {
//        // left
//        trns(p, p,0,1,x,y)
//        C.drawImage(dirt2, 0,0, d,h);
//
//        // top
//        trns(1, 0,-p, -p,x-0.5 +p*d,y+p*d)
//        C.drawImage(grass, 0,0,w,d);
//    }
}

var RGB=function(a,b,c,d) { return "rgba("+a+","+b+","+c+","+(d||1)+")"}
var BBC = RGB(15,15,15,.3) // brick border color

var fourWall=function(x,y,z,w,h,d,wd) {  // wd = wall thickness
    TBC1 = "#226" // top brick color 1
    TBC2 = "#385"
    // bottom
    B=0,BW=40
    X=x,Y=y,Z=z,W=w,H=1,D=d
    addSprite()
    TBC1 = "#e86" // top brick color 1
    TBC2 = "#eda"

    // left
    BC = BBC, Y=y+wd,W=wd,H=h,D=d-wd, B=0x1df,BW=30
    addSprite()
    // back
    X+=wd,Y=y+d-wd,W=w-2*wd,D=wd,B=0x1f7,BW=28
    addSprite()
    // right
    X=x+w-wd,Y=y+wd,W=wd,D=d-wd,B=0x1ff,BW=30
    addSprite()
    // front
    X=x,Y=y,W=w,D=wd,B=0x1df,BW=32
    addSprite()
}

// TODO: make tw,th,wd  automatic?  relative to y?
var turret=function( x,y,z, w,h,d, wd, th,tw,tgap, bw) {  // wd= wall thickness,  th=top-square height, tw=top-width, tgap= gap between two top squares
    fourWall( x,y,z,w,h,d,wd);
    // back
    Y=y+d-wd,Z=z+h-1,W=wd,H=th,D=tw,B=0x1fe,BC=BBC,BW=bw*.9
    for (X=x; X<=x+w-tw; X+=tw+tgap) {
        addSprite();
    }
    // sides
    Z++,B=0x1ef,BW=bw
    for (Y=y+d-wd; Y>y; Y-= tw+tgap) {
        X=x
        addSprite();
        X=x+w-wd
        addSprite();
    }
    Y=y
    Z--,B=0x1fe
    for (X=x; X<=x+w-tw; X+=tw+tgap) {
        addSprite();
    }

}


//  skull: ☠  ⚠   radioactive: ☢  biohazard: ☣  heart: ♥   flower: ⚘❀❃❁☘♧♣  arrow:➸➱➫   sun: ☀   cloud: ☁   coffin: ⚰⚱
var faces = ["(ᵔᴥᵔ)", "{◕ ◡ ◕}", "ಠ◡ಠ", "ಠ_๏", "ಥ_ಥ", "(•‿•)", "☼.☼", "ಠ_ಠ", "(͡๏̯͡๏)", "◔̯◔","ತಎತ", "◉_◉","סּ_סּ", "(｡◕‿◕｡)", "｡◕‿◕｡"]

//
//addSprite(50,50,600,   20, 20, 20,  0x1, "#f0f", 15, brickDraw)
//addSprite(100,50,600,  20, 20, 20,  0x2, "#f0f", 15,  brickDraw)
//addSprite(150,50,600,  20, 20, 20,  0x4, "#f0f", 15, brickDraw)
//addSprite(200,50,600,  20, 20, 20,  0x8, "#f0f", 15, brickDraw)
//addSprite(250,50,600,  20, 20, 20, 0x10, "#f0f", 15, brickDraw)
//addSprite(300,50,600,  20, 20, 20, 0x20, "#f0f", 15, brickDraw)
//addSprite(350,50,600,  20, 20, 20, 0x40, "#f0f", 15, brickDraw)
//addSprite(400,50,600,  20, 20, 20, 0x80, "#f0f", 15, brickDraw)
//addSprite(450,50,600,  20, 20, 20,0x100, "#f0f", 15, brickDraw)


var stairs=function (x1,y1,z1,w1,d1,x2,y2,w2,d2, h,n) {
    BC=BBC,BW=30,B=0x1ee,H=h+1
    range(n, function(){
        X=x1+i*(x2-x1)/n, Y=y1+i*(y2-y1)/n, Z=z1+i*h-1,W=w1+i*(w2-w1)/n,D=d1+i*(d2-d1)/n
        addSprite()
    })
}




