/****
 * TODO: shrink by http://iteral.com/jscrush/  or https://github.com/cowboy/javascript-packify
 *
 * make all function params the same  (a,b,c,d,e...)
 * for non-recursive functions  use globals instead of locals  (remove "var ")  - make sure names do not collide
 * use globals instead of function parameters?   x=4,y=5, addCube()  instead of addCube(4,5)  ?
 * remove seed - all pure random :(
 * shorten canvas functions?  c.lg = c.createLinearGradient
 *
 * make a script that changes all functions to be like this
 * <name>=function(a,b,c,d,e,f,g,h){
 * because the "=function(a,b,c,d,e,f,g,h){" will be shortened by jscrush to one letter
 */




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
var brick=function (w,h,c1,c2,bw,bh) {
    C.fillStyle = c1
    C.fillRect(0,0,w,h)
    C.strokeStyle = c2;
    var row=0;  // TODO: can make global to avoid var
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
var TextureTop= r2c(D,D, function(c) { noise(c, D,D, 80,20, 180,40, 80,40)})
var TextureFront= r2c(D,D, function(c) { noise(c, D,D, 120,20, 110,20, 40,30)})
var TextureRight= r2c(D,D, function(c) { noise(c, D,D, 140,25, 120,25, 50,40)})
var toPattern = function(texture) {
    var r = C.createPattern(r2c(3*D,3*D, function(c) {c.drawImage(texture,0,0,3*D,3*D)}), 'repeat');
    r.draw = function(x,y,w,h) {
        C.fillStyle= this;
        C.fillRect(x,y,w,h)
    }
    return r;
}
var PatternTop = toPattern(TextureTop)
var PatternFront = toPattern(TextureFront)
var PatternRight = toPattern(TextureRight)

var CameraX = 0;
var CameraY = 0;

// toscreen
var toScreenSpace = function ($) {$.sx= $.x+ $.y/2; $.sy=height- $.y/2- $.h- $.z}   // TODO: store y/2 ?

var tree = function(x,y,z, w,h1,h2) {
    X=x,Y=y,Z=z,H=h1
    ts()
    grd = C.createLinearGradient(SX,SY,SX+w,SY)
    grd.addColorStop(0, '#752');
    grd.addColorStop(1, '#964');
    C.fillStyle=grd
    C.fillRect(SX,SY, w,h1)
    SX+=w/2

    range(30+h2, function(i) {
        C.fillStyle=RGB(irnd(25,30),irnd(170,210),irnd(55,70),0.7)
        C.beginPath()
        Y=rnd()
        C.arc(SX+2*w*Y*nrnd(-1,1),SY-h2+Y*(h2+5), 5+Y*rnd()*9,0,TPI)
        C.fill()
    })
}


var CollisionLeftFace = []  // collision when moving left (X--)
var CollisionRightFace = []  // collision when moving right (X++)
var CollisionTopFace = []  // collision when moving down (Z--)
var CollisionBottomFace = []  // collision when moving up (Z++)
//var CollisionBackFace = [] // when moving front (Y--)
//var CollisionFrontFace = [] // when moving back (Y++)

var spritesImageCache = {}
var spritesImageCacheList = []

var MIN_BLOCK = 16
// using globals
// Y   D
// B - borders
// BL - border color
// BW - brick width
// DR - draw
var addCube = function(x,z,w,h) {  // container
    addNonBlockCube(x,z,w,h)
    // hack: because player-Y doesn't change avoid adding collision bodies for Y the player won't hit
    if (Y+D < IPY  || Y > IPY) {
        return;
    }

    // add blocking data
    if (D>MIN_BLOCK && h>MIN_BLOCK) {
        CollisionLeftFace.push({
            y:Y,z:z,
            d:D, h:h, w:0,
            x:x
        })
        CollisionRightFace.push({
            y:Y,z:z,
            d:D, h:h,w:0,
            x:x+w
        })
    }
    if (D>MIN_BLOCK && w>MIN_BLOCK) {
        CollisionTopFace.push({
            x:x,y:Y,
            w:w, d:D, h:0,
            z:z+h
        })
        CollisionBottomFace.push({
            x:x,y:Y,
            w:w, d:D, h:0,
            z:z
        })
    }
//    if (h>MIN_BLOCK && w>MIN_BLOCK) {    // Changed my mind: this is going to be a left-right up-down game,  no front-back movement
//        CollisionBackFace.push({
//            x:x,z:z,
//            w:w, h:h, d:0,
//            y:Y+D
//        })
//        CollisionFrontFace.push({
//            x:x,z:z,
//            w:w, h:h, d:0,
//            y:Y
//        })
//    }
}

var collide = function(x,y,z,r, C) {  // C is either CollisionRightFace/CollisionLeftFace/CT/CollisionBackFace/etc..,   (x,y,z) is the bottom left front corner, r is the cube height/width/depth (same all)
    return breach(C, function($,i) {
        // doing cube collision for simplicity - TODO: change to sphere collision
        if ((x+r > $.x && x < $.x+$.w ) &&
            (y+r > $.y && y < $.y+$.d) &&
            (z+r > $.z && z < $.z+$.h )) {
            return $;
        }
    })
}


var findFloor = function(x,y,z, r) {
    // find floor below the point
    var maxPlane = {z:-10e9};
    each(CollisionTopFace, function($) {
        if ($.z >maxPlane.z && // above the current maxPlane
            z+r >  $.z && // but below the player
            x+r >  $.x && x<$.x+$.w &&
            y+r >  $.y && y<$.y+$.d ) {
            maxPlane = $;
        }
    })
    return maxPlane;
}


var spriteId = 0

var addSprite = function($) {
    $.id = spriteId++;
    sprites.push($)
}

// using globals - for values that are usually the same
// D = depth (ie. width of y-axis)
// Y = location of y-axis
// B - borders
// BC - border color
// BW - brick width
// DR - draw function or array of 3 draw functions
var addNonBlockCube=function(x,z,w,h) {
    BH = BH || BW *.3;
    var cube = {
        x:x, // world x
        y:Y,
        z:z,

        w:w,
        h:h,
        d:D,
        sw: w+D/2,      // screen width
        sh: h+D/2,       // screen height
        uncachedDraw: drawCube00,
        draw: drawSprite
    }
    toScreenSpace(cube)

    if (w>0 && h>0) {
        cube.front = {
            col1: FBC1,
            col2: FBC2,

            texture: PatternFront,
            dim1: w,
            dim2: h,
            bw:BW, // brick width
            bh:BH,
            bc:BC, // border color
            borders: B,
            //preDraw: frontDraw,
            draw: DR[0] || DR   // DR can be array of 3 functions, or a function
        }
    }

    if (D>0 && h>0) {
        cube.right = {
            col1: RBC1,
            col2: RBC2,
            texture: PatternRight,
            dim1: D,
            dim2: h,
            bw:BW, // brick width
            bh:BH,
            bc:BC, // border color
            borders: B >> 4,
            //preDraw: rightDraw,
            draw: DR[1] || DR
        }
    }

    if (w>0 && D>0) {
        cube.top = {
            col1: TBC1,
            col2: TBC2,
            texture: PatternTop,
            dim1: w,
            dim2: D,
            bw:BW, // brick width
            bh:BH,
            bc:BC, // border color
            borders: B>> 8,
            //preDraw: topDraw,
            draw: DR[2] || DR
        }
    }

    addSprite(cube);
}

// draw the cube at zero zero location
var drawCube00 = function(cube) {
    if (cube.front) {
        C.setTransform(1, 0,0,1, 0, cube.d/2);
        cube.front.draw(cube.front);
    }
    if (cube.top) {
        C.setTransform(1, 0,-.5,.5, 0.4 +cube.d/2, 0);
        cube.top.draw(cube.top);
    }
    if (cube.right) {
        C.setTransform(.5, -.5,0,1, cube.w, cube.d/2);
        cube.right.draw(cube.right);
    }

    // draw left facing cubes:
//    else {  p = -.5
//        // left
//        trns(p, p,0,1,x,y)
//        C.drawImage(dirt2, 0,0, d,h);
//
//        // top - for left facing cube
//        trns(1, 0,-p, -p,x-0.5 +p*d,y+p*d)
//        C.drawImage(grass, 0,0,w,d);
//    }
}

var MAX_SPRITES_IN_CACHE = 50;

var drawSprite = function($) {
    var index = spritesImageCacheList.indexOf($.id)
    if (index != -1) {
        if (index < spritesImageCacheList.length-1) {
            spritesImageCacheList.splice(index,1)
            spritesImageCacheList.push($.id)
        }
    }
    else {
        if (spritesImageCacheList.length >= MAX_SPRITES_IN_CACHE) {
            var id = spritesImageCacheList.shift();
            log("Removing from cache cube "+id)
            delete spritesImageCache[id]
        }
        spritesImageCacheList.push($.id);
        var buffer = r2c($.sw, $.sh, function(canvas) {
            var oldC = C;
            C = canvas;
            $.uncachedDraw($)
            C = oldC;
        })
        log("Adding to cache cube "+ $.id+ "  X:"+ $.x+" Y:"+ $.y+" Z:"+ $.z+" W:"+ $.w+" H:"+ $.h+" D:"+ $.d);
        spritesImageCache[$.id] = buffer;
    }

    spritesImageCache[$.id].draw($.sx, $.sy- $.d/2, $.sw, $.sh)
    //C.fillStyle = RGB(40,50,180, 0.5);
    //C.fillRect($.sx, $.sy- $.d/2, $.sw, $.sh);
}

var spritesInWindow = function(collection, x,y,w,h) {
    var result = [];
    var right = x+ w, down = y+h;
    each(collection, function($) {
        if ($.sx+ $.sw >= x &&
            $.sx <= right &&
            $.sy+ $.sh - $.d/2 >= y &&
            $.sy - $.d/2 <= down ) {
            result.push($)
        }
    })
    return result;
}


var TBC1 = "#e86" // top brick color 1
var TBC2 = "#eda"
var FBC1="#d74" // front brick color
var FBC2="#dc8"
var RBC1="#b52"
var RBC2="#ba6"


//  Borders
//       __________
//      /    B    /|
//     /C       A/ |      0xFFF <-- Front           all:  0xFFF
//    /    9    /7 |        ^^                      no top, no bottom:    0x0AA
//   +---------+   |6       | \
//   |    2    |8  |       /   \
//   3         1  /       Top   Right
//   |         | /5
//   +--- 0 ---+/

var drawBorders=function($) {
    var b = $.borders, w=$.dim1, h=$.dim2;
    if (b & 15) {
        C.strokeStyle = $.bc;
        C.beginPath();
        if (b&1) {
            C.moveTo(0,0)
            C.lineTo(w,0)
        }
        if (b&2) {
            C.moveTo(w,0)
            C.lineTo(w,h)
        }
        if (b&4){
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

// TODO: automatic border cancelation:
//    ________
//    |       |_
//    |        _|   <-- left border of small cube is canceled because contained in right border of big cube
//    |_______|


var _setAlpha=function($) {
    if ($.sx-10 < Player.sx+Player.sw && $.sx+10+ $.sw > Player.sx  && $.y+ $.d < Player.y &&
        $.sy-10 < Player.sy+Player.sh && $.sy+10+ $.sh > Player.sy
        ) {
        C.globalAlpha = .3  // TODO: make alpha based on distance from player
    }
    else {
        C.globalAlpha = 1
    }
}

// return true if the cubeA should be drawn before the cubeB
var behindCube = function(cubeA, cubeB) {
    // I allow up to "few" pixels of intersection because the editor isn't precise
    var few=3
    if  ((cubeB.y+cubeB.d <= cubeA.y+few)  ||   // A is behind B
         (cubeA.z+cubeA.h <= cubeB.z+few)  ||   // A is below B
         (cubeA.x+cubeA.w <= cubeB.x+few))      // A is to the left of B
        return true;  // first draw A then B
    if ((cubeA.y+cubeA.d <= cubeB.y+few)  || // B is behind A
        (cubeB.z+cubeB.h <= cubeA.z+few)  || // B is below A
        (cubeB.x+cubeB.w <= cubeA.x+few))    // B is to the left of A
        return false; // first draw B then draw A

    // the two cubes are intersecting!
    console.log("cubes intersection: ", cubeA, cubeB);
    return null;
}



var brickDraw=function($) {
    brick($.dim1, $.dim2, $.col1, $.col2, $.bw, $.bh);
    drawBorders($)
}

var textureDraw=function($) {
    $.texture.draw(0,0, $.dim1, $.dim2)
    drawBorders($)
}


var fourWall=function(x,y,z,w,h,d,wd) {  // wd = wall thickness
    TBC1 = "#226" // top brick color 1
    TBC2 = "#385"
    // bottom
    B=0,BW=40
    Y=y; D=d;
    addCube(x,z,w,1)
    TBC1 = "#e86" // top brick color 1
    TBC2 = "#eda"

    // left
    BC = BBC; Y=y+wd; D=d-wd; B=0x1df; BW=30
    addCube(x,z,wd,h)
    // back
    Y=y+d-wd; D=wd; B=0x1f7; BW=28
    addCube(x+wd, z, w-2*wd, h)
    // right
    Y=y+wd; D=d-wd; B=0x1ff; BW=30
    addCube(x+w-wd, z, wd, h)
    // front
    Y=y; D=wd; B=0x1df; BW=32
    addCube(x,z, w, h)
}

// TODO: make tw,th,wd  automatic?  relative to y?
var turret=function( x,y,z, w,h,d, wd, th,tw,tgap, bw) {  // wd= wall thickness,  th=top-square height, tw=top-width, tgap= gap between two top squares
    fourWall( x,y,z,w,h,d,wd);
    // back
    Y=y+d-wd;
    var Z=z+h-1;
    D=tw; B=0x1fe; BC=BBC; BW=bw*.9;
    for (var X=x; X<=x+w-tw; X+=tw+tgap) {
        addCube(X, Z, wd, th);
    }
    // sides
    Z++;
    B=0x1ef; BW=bw
    var X=x+w-wd;
    for (Y=y+d-wd; Y>y; Y-= tw+tgap) {
        addCube(x, Z, wd, th);
        addCube(X, Z, wd, th);
    }
    Y=y;
    Z--;
    B=0x1fe;
    for (var X=x; X<=x+w-tw; X+=tw+tgap) {
        addCube(X, Z, wd, th);
    }

}


//  skull: ☠  ⚠   radioactive: ☢  biohazard: ☣  heart: ♥   flower: ⚘❀❃❁☘♧♣  arrow:➸➱➫   sun: ☀   cloud: ☁   coffin: ⚰⚱
var faces = ["(ᵔᴥᵔ)", "{◕ ◡ ◕}", "ಠ◡ಠ", "ಠ_๏", "ಥ_ಥ", "(•‿•)", "☼.☼", "ಠ_ಠ", "(͡๏̯͡๏)", "◔̯◔","ತಎತ", "◉_◉","סּ_סּ", "(｡◕‿◕｡)", "｡◕‿◕｡"]

//
//addCube(50,50,600,   20, 20, 20,  0x1, "#f0f", 15, brickDraw)
//addCube(100,50,600,  20, 20, 20,  0x2, "#f0f", 15,  brickDraw)
//addCube(150,50,600,  20, 20, 20,  0x4, "#f0f", 15, brickDraw)
//addCube(200,50,600,  20, 20, 20,  0x8, "#f0f", 15, brickDraw)
//addCube(250,50,600,  20, 20, 20, 0x10, "#f0f", 15, brickDraw)
//addCube(300,50,600,  20, 20, 20, 0x20, "#f0f", 15, brickDraw)
//addCube(350,50,600,  20, 20, 20, 0x40, "#f0f", 15, brickDraw)
//addCube(400,50,600,  20, 20, 20, 0x80, "#f0f", 15, brickDraw)
//addCube(450,50,600,  20, 20, 20,0x100, "#f0f", 15, brickDraw)


var stairs=function (x1,y1,z1,w1,d1,x2,y2,w2,d2, h,n) {
    BC=BBC;
    BW=30;
    B=0x1ee;
    H=h+1;
    range(n, function(i){
        Y=y1+i*(y2-y1)/n;
        D=d1+i*(d2-d1)/n;
        addCube(x1+i*(x2-x1)/n,  z1+i*h-1,  w1+i*(w2-w1)/n)
    })
}




