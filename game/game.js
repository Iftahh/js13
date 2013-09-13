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




var CollisionLeftFace;  // collision when moving left (X--)
var CollisionRightFace;  // collision when moving right (X++)
var CollisionTopFace;  // collision when moving down (Z--)
var CollisionBottomFace;  // collision when moving up (Z++)
//var CollisionBackFace = [] // when moving front (Y--)
//var CollisionFrontFace = [] // when moving back (Y++)

var spritesImageCache;
var spritesImageCacheList;

var MIN_BLOCK = 16
var addCubeCollision=function(x,z,w,h, $) {
    // hack: because player-Y doesn't change avoid adding collision bodies for Y the player won't hit
    if (Y+D < IPY  || Y > IPY) {
        return {};
    }

    var result = {
    }

    // add blocking data
    if (D>MIN_BLOCK && h>MIN_BLOCK) {
        result.CL = {
            y:Y,z:z,
            d:D, h:h, w:0,
            x:x
        }
        CollisionLeftFace.push(result.CL);
        result.CR = {
            y:Y,z:z,
            d:D, h:h,w:0,
            x:x+w
        }
        CollisionRightFace.push(result.CR);
    }
    if (D>MIN_BLOCK && w>MIN_BLOCK) {
        result.CT = {
            x:x,y:Y,
            w:w, d:D, h:0,
            z:z+h,
            sprite: $ // needed when standing on this one
        }
        if (!$) debugger
        CollisionTopFace.push(result.CT)
        result.CB = {
            x:x,y:Y,
            w:w, d:D, h:0,
            z:z
        }
        CollisionBottomFace.push(result.CB)
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
    return result;
}

// using globals
// Y   D
// B - borders
// BL - border color
// BW - brick width
// DR - draw
var addCube = function(x,z,w,h) {
    var cube= addNonBlockCube(x,z,w,h);
    cube.collisionFaces = addCubeCollision(x,z,w,h, cube)
    return cube;
}

var addBrokenCube=function(x,z,w,h) {
    var dw,dh,rx,rz;
    if (w>h) {
        // break horizontal floor
        dw = min(w,40);
        dh=h;
        rx=0;
        rz = min(h/5,10);
    }
    else {
        // break vertical wall
        dw=w;
        dh = min(h,40);
        rx= min(w/5,20);
        rz=0;
    }
//    var _d=D;
//    D = max(D/4, 40);
//    var _y=Y;
    for (var xx=x; xx+dw<=x+w; xx+= dw) {
//        for (Y=_y+_d; Y>_y; Y-= D) {
            for (var zz=z; zz+dh<=z+h; zz+= dh) {
                addCube(xx+nrnd(0,rx),zz+nrnd(0,rz),dw,dh);
                spriteId--; // next cubes will share ID - share cache!
            }
//        }
    }
//    Y = _y;
//    D=_d;
    spriteId++;
    if (xx != x+w || zz != z+h) {
        // add one final cube to finish the missing space
        if (zz == z+h) {
            w = w-xx+x;
            x=xx;
        }
        else {
            h = h-zz+z;
            z = zz;
        }
        addCube(x+nrnd(0,rx),z+nrnd(0,rz), w,h);
    }
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

var addMovingCube=function(cube, x1,y1,x2,y2, speed) {
    update(cube, {
        vx: ((x2-x1)/160)*speed/10,
        vz: ((y2-y1)/160)*speed/10,
        maxZ: max(y1,y2),
        minZ: min(y1,y2),
        maxX: max(x1,x2),
        minX: min(x1,x2),
        update: function($,dt) {
            var dx = $.x, dz= $.z;
            $.x += $.vx*dt;
            if ($.x > $.maxX || $.x < $.minX) {
                $.x = max(min($.x, $.maxX), $.minX);
                $.vx *= -1;
            }
            $.z += $.vz*dt;
            if ($.z > $.maxZ || $.z < $.minZ) {
                $.z = max(min($.z, $.maxZ), $.minZ);
                $.vz *= -1;
            }
            dx = $.x-dx;
            dz = $.z-dz;

            var subCubes = $.subCubes || [$]
            each(subCubes, function(sc) {
                sc.sx += dx;
                sc.sy -= dz; // no real need to calculate the x,z of the subcubes - only sx,sy and collision
                var c = sc.collisionFaces;
                // TODO: instead of updating many faces - the faces should point to parent
                if (c.CL) {
                    c.CL.z+=dz;
                    c.CL.x+=dx;
                    c.CR.z+=dz;
                    c.CR.x+=dx;
                }
                if (c.CT) {
                    c.CT.x+=dx;
                    c.CT.z+=dz;
                    c.CB.x+=dx;
                    c.CB.z+=dz;
                }
            })

            if ($.subCubes) {
                $.sx += dx;
                $.sy -= dz;
            }
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
var generateCube=function(x,z,w,h) {
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
        uncachedDraw: drawCube,
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
    return cube;
}


var addNonBlockCube=function(x,z,w,h) {
    var cube = generateCube(x,z,w,h)
    addSprite(cube);
    return cube;
}


// draw the cube at location (sx,sy)
var drawCube = function(cube, sx,sy) {
    sx = sx||0; sy=sy||0;
    var d_2 = cube.d/2;
    if (cube.front) {
        C.setTransform(1, 0,0,1, sx, sy+ d_2);
        cube.front.draw(cube.front);
    }
    if (cube.top) {
        C.setTransform(1, 0,-.5,.5, sx+0.4 +d_2, sy);
        cube.top.draw(cube.top);

        // special hack... draw flowers
//        if (cube.top.draw == textureDraw) {
//            // draw some random flowers
//            C.font = '14pt sans-serif';
//            //C.setTransform(1, 0,0,1, 0, 0);
//            C.beginPath()
//            C.fillStyle = "#df6060"
//            C.strokeStyle = "#aa5050"
//            C.shadowBlur= 10;
//            C.shadowColor ="#ad6060"
//            range(irnd(0,cube.w/30), function(i) {
//
//                var text = "❀❃❁"[irnd(0,3)];
//                C.fillText(text, irnd(5, cube.w-5), irnd(5, cube.d-5));
//            })
//            C.fill();
//            C.stroke();
//        }
    }
    if (cube.right) {
        C.setTransform(.5, -.5,0,1, sx+cube.w, sy+d_2);
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
        log("Adding to cache sprite "+ $.id+ "  X:"+ $.x+" Y:"+ $.y+" Z:"+ $.z+" W:"+ $.w+" H:"+ $.h+" D:"+ $.d);
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

var alpha = 1;
var _setAlpha=function(al) {  // not sure this is necessary - will setting the same alpha value to canvas trigger expensive work like setting same width?
    if (al != alpha) {
        C.globalAlpha = al;
        alpha = al;
    }
}

var setAlpha=function($) {
    if ($.isCoin) {
        _setAlpha(1)  // coins never become transparent
        return;
    }
    if ($.sx-10 < Player.sx+Player.sw && $.sx+10+ $.sw > Player.sx  && $.y+ $.d < Player.y &&
        $.sy-10 < Player.sy+Player.sh && $.sy+10+ $.sh > Player.sy
        ) {
        _setAlpha(.3)  // TODO: make alpha based on distance from player
    }
    else {
        _setAlpha(1)
    }
}

// return true if the cubeA should be drawn before the cubeB
var behindPlayer = function(cubeA) {
//    if (cubeA.subCubes) {
//        return breach(cubeA.subCubes, behindPlayer);
//    }
    var cubeB= Player;
    // I allow up to "few" pixels of intersection because the editor isn't precise
    var few=3
    if (cubeA.y+cubeA.d <= cubeB.y+few) // B is behind A
        return false;

    if  ((cubeB.y+cubeB.d <= cubeA.y+few)  ||   // A is behind B
         (cubeA.z+cubeA.h <= cubeB.z+few)  ||   // A is below B
         (cubeA.x+cubeA.w <= cubeB.x+few))      // A is to the left of B
        return true;  // first draw A then B
    if (
        (cubeB.z+cubeB.h <= cubeA.z+few)  || // B is below A
        (cubeB.x+cubeB.w <= cubeA.x+few))    // B is to the left of A
        return false; // first draw B then draw A

    // the two cubes are intersecting!
    log("cubes intersection: ", cubeA, cubeB);
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

var spikesDraw=function($,sx,sy) {
    sx=sx||0; sy=sy||0;
    C.setTransform(1, 0,0,1, sx, sy);
    C.fillStyle = RGB(190,190,190)
    C.strokeStyle = RGB(40,40,40);
    C.lineWidth = 1;
    for (var y = $.d/2-5; y >= 0; y-= 10) {
        var _y = $.sh - y;
        C.beginPath()
        for (var x=0; x<= $.w; x+=20) {
            C.moveTo(x+ y, _y);
            C.lineTo(x+ y+5, _y- $.h);
            C.lineTo(x+ y+10, _y);
        }
        C.stroke();
        C.fill();
    }
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
//var faces = ["(ᵔᴥᵔ)", "{◕ ◡ ◕}", "ಠ◡ಠ", "ಠ_๏", "ಥ_ಥ", "(•‿•)", "☼.☼", "ಠ_ಠ", "(͡๏̯͡๏)", "◔̯◔","ತಎತ", "◉_◉","סּ_סּ", "(｡◕‿◕｡)", "｡◕‿◕｡"]

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
    var H=h+1;
    range(n, function(i){
        Y=y1+i*(y2-y1)/n;
        D=d1+i*(d2-d1)/n;
        addCube(x1+i*(x2-x1)/n,  z1+i*h-1,  w1+i*(w2-w1)/n, H)
    })
}


var toScreenSpaceForGroup=function(group, sprite) {
    var minX,minY,minZ,left,top,maxX,maxY,maxZ,right,bottom
    minX=minY=minZ=left=top=Infinity;
    maxX=maxY=maxZ=right=bottom=-Infinity;

    each(group, function(cube) {
        left = min(left, cube.sx);
        right = max(right, cube.sx+cube.sw)
        top = min(top, cube.sy)
        bottom = max(bottom, cube.sy+cube.sh)
        minX=min(minX, cube.x);
        maxX=max(maxX, cube.x+cube.w);
        minY=min(minY, cube.y);
        maxY=max(maxY, cube.y+cube.d);
        minZ=min(minZ, cube.z);
        maxZ=max(maxZ, cube.z+cube.h);
    })
    update(sprite, {
        sx: left,
        sy: top,
        sw: right-left+1,
        sh: bottom-top+1,
        x:minX,
        y:minY,
        z:minZ,
        w:maxX-minX+1,
        h:maxZ-minZ+1,
        d:maxY-minY+1
    })
}

var addGroupSprite=function(group) {
    var sprite = {
        subCubes: group,
        uncachedDraw: function($) {
            each($.subCubes, function(cube) {
                cube.uncachedDraw(cube, cube.sx- $.sx, cube.sy - $.sy);
            })
        },
        draw: drawSprite,
        toScreenSpace: function($) {
            each($.subCubes, function(cube) {
                toScreenSpace(cube)
            })
            toScreenSpaceForGroup($.subCubes, $)
        }
    }
    toScreenSpaceForGroup(group, sprite)
    addSprite(sprite);
    return sprite;
}

var addTreeSprite=function(x,y) {
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
}

var imgFlag=0;

var addFlag=function(x,y,height) {
    var flag = {
        x:x,z:y, y:IPY+10,
        h:height,w:10,d:0,
        sh:height,sw:10,
        hit:false,
        draw: function($) {
            C.fillStyle = "#a73";
            C.fillRect($.sx, $.sy, $.sw, $.sh);
            if ($.hit) {
                if (!imgFlag) {
                    imgFlag = r2c(50,30, function(c) {
                        c.fillStyle = "#aaf";
                        c.strokeStyle = "#000";
                        c.fillRect(0,0,50,30);
                        c.strokeRect(0,0,50,30);
                        c.fillStyle = "#fe7"
                        c.font="24px arial";
                        c.drawImage(Player.rightImg, 15,8, 20,20);
                        c.fillText("♛",12,12)
                    })
                }
                C.drawImage(imgFlag, $.sx-50, $.sy);
            }
        },
        update: function($) {
            if (!$.hit && $.sx >= Player.sx-coinPad && $.sx < Player.sx+P2R+coinPad && $.sy+ $.sh >= Player.sy-coinPad && $.sy < Player.sy+P2R+coinPad) {
                if (totalTime - lastTimeHadCoin > 3000) // 3 sec
                    coinSoundIndex=0;

                coinsSounds[coinSoundIndex++].play();
                coinSoundIndex = coinSoundIndex % coinsSounds.length;
                lastTimeHadCoin = totalTime;
                $.hit = true;
                IPX = $.x;
                IPZ = $.z;
            }
        }
    }
    toScreenSpace(flag);
    addSprite(flag)
}

var addTextSprite=function(x,y,color,stroke,fam,size,text) {
    C.font = size+'pt '+fam;
    var width = 0;
    var lines = text.split('\n')
    each(lines, function(l) {
        var metrics = C.measureText(l);
        width = max(width,metrics.width);
    })
    var height = size*1.2* (lines.length+1);

    var textSprite = {
        x:x, z:y, y:Y,
        h:height, w:width, d:0,
        sh: height, sw:width,
        lines:lines,
        dy: size*1.2,
        color:color,
        stroke:stroke,
        fam:fam,
        size:size,
        uncachedDraw: function($,sx,sy) {
            C.font = $.size+'px '+ $.fam;
            C.textAlign = 'center';
            C.fillStyle = '#'+ $.color;
            C.strokeStyle = '#'+ $.stroke;
            var y= $.dy;
            var x = $.w/2
            each($.lines, function(l) {
                C.fillText(l, x, y);
                C.strokeText(l, x, y)
                y += $.dy;
            })

        },
        draw: function($) {
            var dx = abs(Player.sx - ($.sx+ $.sw/2))
            if (dx > $.sw+100 ) {
                return;
            }
            var dy = abs(Player.sy - ($.sy+ $.sh/2));
            if (dy > $.sh+100) {
                return;
            }
            _setAlpha(max(0,min(1, 1.4-(dy/ ($.sh+100)) - (dx/ ($.sw+100)))))
            drawSprite($)
            _setAlpha(1)
        }
    }
    toScreenSpace(textSprite)
    addSprite(textSprite)
}


var loadLevel=function(lvl) {
    sprites = []
    CollisionLeftFace = []
    CollisionRightFace = []
    CollisionTopFace = []
    CollisionBottomFace = []
    OffsetX=OffsetY=0;
    spritesImageCacheList = []
    spritesImageCache = {}

    IPX = 0
    IPY = 50
    IPZ= 0;

    BW=27;BC=BBC;
    B = 0xfff;
    Y=0; D=100;
    for (var i=0; i<lvl.length;) {
        var type = lvl[i++];
        switch (type) {
            case 0: // player
                IPX=lvl[i++];
                IPZ=lvl[i++];
                initPlayer();
                break;
            case 1: // coin
                addCoin(lvl[i++],lvl[i++])
                break;
            case 2: // enemy
                addEnemy(lvl[i++],lvl[i++])
                break;
            case 3: // brick platform
            case 4: // texture platform
                DR= type == 3 ? brickDraw : textureDraw;
                addCube(lvl[i++],lvl[i++],lvl[i++],lvl[i++]);   // todo: also DR, Y and D ?
                break;
            case 10: // spikes
                var cube = addCube(lvl[i++],lvl[i++],lvl[i++],lvl[i++])
                cube.collisionFaces.CT.spikes = true;
                cube.uncachedDraw = spikesDraw;
                break;
            case 5: // change default Y and D
                Y = lvl[i++];
                D = lvl[i++];
                break;
            case 11: // moving group
                var x1=lvl[i++], y1=lvl[i++],x2=lvl[i++],y2=lvl[i++], speed=lvl[i++];
                // no break!
            case 6:  // group
                var _lvl = lvl;
                var lvl=lvl[i++];
                var _i = i;  // for efficient compression - repeat lvl[i++]  - need to backup lvl and i
                var groupSprite = [];
                var _sprites =  sprites;
                sprites = groupSprite;
                var groupW2,groupH2;
                if (type == 11) {
                    var minX = 10e6;
                    var minY = minX;
                    var maxX = -10e6;
                    var maxY = maxX;
                    for (i=0; i<lvl.length;) {
                        i++;
                        var x = lvl[i++]
                        var y = lvl[i++]
                        minX = min(minX, x)
                        minY = min(minY, y)
                        maxX = max(maxX, x+lvl[i++])
                        maxY = max(maxY, y+lvl[i++])
                    }
                    groupW2 = (maxX-minX+1);
                    groupH2 = (maxY-minY+1);
                    y1 -= groupH2; // the import logic had no knowledge of groupH - so needs to be fixed now
                    y2 -= groupH2;
                    groupH2 /=2;
                }


                for (i=0; i<lvl.length;) {
                    var type2 = lvl[i++];
                    var $x=lvl[i++],$y=lvl[i++],$w=lvl[i++],$h= lvl[i++], x,y;
                    if (type == 11) {
                        x = $x-minX+x1-groupW2;
                        z = $y-minY+y1-groupH2;
                    }
                    else {
                        x=$x; z=$y;
                    }
                    switch(type2) {
                        case 3: // brick platform
                        case 4: // texture platform
                            DR = type2 == 3 ? brickDraw : textureDraw;
                            addCube(x,z,$w,$h);
                            break;
                        case 10:
                            var cube = addCube(x,z,$w,$h);
                            cube.collisionFaces.CT.spikes = true;
                            cube.uncachedDraw = spikesDraw;
                            break;
                        default:
                            log("Error loading level at index "+_i+"  subindex "+i+" type: "+type2);
                    }
                }
                lvl = _lvl; // restore backups
                i = _i;
                sprites = _sprites;
                var sprite = addGroupSprite(groupSprite);
                if (type == 11) { // moving group
                    each(sprite.subCubes, function($) {
                        if ($.collisionFaces.CT) {
                            $.collisionFaces.CT.sprite = sprite;
                        }
                    })

                    addMovingCube(sprite, x1-groupW2,y1-groupH2,x2-groupW2,y2-groupH2, speed)
                }
                break;
            case 7: // moving brick platform
            case 8: // moving texture platform
                DR = type== 7 ? brickDraw : textureDraw;
                var x1=lvl[i++],y1=lvl[i++],x2=lvl[i++],y2=lvl[i++], w=lvl[i++], h=lvl[i++], speed=lvl[i++];
                var x = x1-w/2;
                var z = y1-h/2
                var cube = addCube(x,z,w,h);
                addMovingCube(cube, x1,y1,x2,y2, speed)
                break;
            case 9: // enemy with speed
                addEnemy(lvl[i++],lvl[i++], lvl[i++])
                break;
            case 12:// brick platform - broken
            case 13: // texture platform - broken
                DR= type == 12 ? brickDraw : textureDraw;
                addBrokenCube(lvl[i++],lvl[i++],lvl[i++],lvl[i++]);   // todo: also DR, Y and D ?
                break;
            case 14: // text
                addTextSprite(lvl[i++], lvl[i++], lvl[i++], lvl[i++], lvl[i++], lvl[i++], lvl[i++]);
                break;
            case 15: // flag
                addFlag(lvl[i++],lvl[i++],lvl[i++]);
                break;
            default:
                log("Error loading level at index "+i+"  type: "+type);

        }
    }
}
