

c = document.getElementById('c')
width = c.width;
height = c.height;
c = c.getContext('2d')
rnd = Math.random
abs = Math.abs
min = Math.min
cos= Math.cos
rq = requestAnimationFrame
floor = Math.floor
trns = function(hsc,hsk,vsk,vsc,x,y) { c.setTransform(hsc,hsk,vsk,vsc,x,y) }
OA = 255 // opaque alpha
stroke= c.stroke
fillText= c.fillText
fill= c.fill
save= c.save

PI = Math.PI
TPI = 2*PI

seedValue=rnd()
function myRandom()
{
    seedValue = (seedValue * 22695477 + 1) & 0xffffff;
    return (seedValue >> 16) & 0x7fff;
    //return Math.floor(Math.random()*301);
}

RS = [] // rotation scale
for (i=0; i<128; i++) { // skipping 0 and
    s = abs(Math.sin(TPI*i/128))
    if (s> 0.1)
        RS.push(s)
}
coins = {
    init: function() {
        save()
        c.strokeStyle = "#aa6"
        c.shadowBlur=30;
        c.lineWidth=2;
        c.shadowColor="#ff2"
    },
    draw: function($) {
        c.beginPath();
        L = RS.length
        var d= ($.t+t)%L;
        trns(RS[d],0,0,1, $.x, $.y)
        c.fillStyle = "#fe4"
        c.arc(0, 0, 10, 0, TPI);
        fill();
        c.fillStyle = "#aa6"
        if (d>L/2)
            fillText("1",-3,3.5)
        else
            fillText("\u265B",-5,3.5)
        stroke();
    }
}

// render to canvas
function r2c(width, height, renderFunction) {
    var buffer = document.createElement('canvas');
    buffer.width = width;
    buffer.height = height;
    renderFunction(buffer.getContext('2d'));
    return buffer;
}

function RGBA(r,g,b)
{
    this.r=r;
    this.g=g;
    this.b=b;
    this.a=OA;
}

function setPixel(d,x, r, g, b, a) {
    d[x] = r;
    d[x+1] = g;
    d[x+2] = b;
    d[x+3] = a;
}

function noise(c,w,h,r1,dr,g1,dg,b1,db) { //random noise texture
    var imgData=c.createImageData(w,h);
    var d = imgData.data;
    for (var i=0;i<d.length;i+=4)
        setPixel(d,i,r1+rnd()*dr,g1+rnd()*dg,b1+rnd()*db,OA)
    c.putImageData(imgData,0,0);
}

// TODO: save some space by using global c and not param c
// brick texture at cavas c, of width and height,  bw = brick width, nr= num rows
function brick(c,w,h,bw,bh,c1,c2) {
    c.fillStyle = c1
    c.fillRect(0,0,w,h)
    c.strokeStyle = c2;
    row=0
    c.lineWidth = bh/5
    y0=0;y1=bh
    c.beginPath()
    while(y1<=h) {
        row++;
        c.moveTo(0, y1)
        c.lineTo(w,y1)
        x0 = row & 1 ? bw: bw/2;
        while(x0<w) {
            c.moveTo(x0,y0)
            c.lineTo(x0,y1)
            x0 += bw
        }
        y0 = y1
        y1 += bh
    }
    c.stroke()
}




coins.d = [] // data
for (i=0; i<10; i++) {
    coins.d.push({x:rnd()*700+50, y:rnd()*500+50, t:floor(rnd()*100)})
}


// changed to be grey-scale only
function cosineInterpolate(p, v, x, y)
{
    var f1, f2, mf1, mf2, g0, g1, g2, g3;
    mf1=(1-cos(x*PI))/2;
    mf2=(1-cos(y*PI))/2;
    f1=1-mf1;
    f2=1-mf2;
    g0=f1*f2;
    g1=mf1*f2;
    g2=f1*mf2;
    g3=mf1*mf2;

    p.b= p.g= p.r= v[0].r*g0+v[1].r*g1+v[2].r*g2+v[3].r*g3;
    //p.g= v[0].g*g0+v[1].g*g1+v[2].g*g2+v[3].g*g3;
    //p.b= v[0].b*g0+v[1].b*g1+v[2].b*g2+v[3].b*g3;
}


function subPlasma(layer, dist, seed, amplitude)
{
    var x, y, X=layer.X, Y=layer.Y, offset, offset2, corner = [], oodist;

    if (seed)
        seedValue=seed;
    amplitude--;
    for (y=0; y<Y; y+=dist)
        for (x=0; x<X; x+=dist)
        {
            var p =layer[y*X+x];
            p.r=p.g=p.b=myRandom() & amplitude;
        }

    if (dist<1)
        return;

    oodist=1/dist;

    for (y=0; y<Y; y+=dist)
    {
        offset=y*X;
        offset2=((y+dist) % Y)*X;
        for (x=0; x<X; x+=dist)
        {
            var T = (x+dist) % X;
            corner[0]=layer[x+offset];
            corner[1]=layer[T+offset];
            corner[2]=layer[x+offset2];
            corner[3]=layer[T+offset2];
            for (var b=0; b<dist; b++)
                for (var a=0; a<dist; a++) {
                    cosineInterpolate(layer[x+a+(y+b)*X], corner, oodist*a, oodist*b);
                }


        }
    }
}


function perlinNoise( layer,  dist,  seed,  amplitude,  persistence,  octaves)
{
    subPlasma(layer, dist, seed, 1);
    for ( var i=0; i<octaves; i++)
    {
        amplitude=(amplitude*persistence)>>8;
        dist=dist>>1;
        if (amplitude<=0 || dist<=0) return;
        subPlasma(TEMPL, dist, 0, amplitude);
        for (var v=0; v<layer.XY; v++)
        {
            var p = layer[v];
            var t = TEMPL[v];
            p.r=min(OA,p.r+t.r);
            p.g=min(OA,p.g+t.g);
            p.b=min(OA,p.b+t.b);
        }
    }
}


function copyTemp(src)
{
    TEMPL.X = src.X;
    TEMPL.Y = src.Y;
    TEMPL.XY = src.XY;
    for (var x=0; x<src.XY; x++)
    {
        var T= TEMPL[x];
        var S = src[x];
        T.r= S.r;
        T.g= S.g;
        T.b= S.b;
        T.a= S.a;
    }
}

function pmod (x,m) {
    return (x+m)% m;
}

// changed to grey-scale
function embossLayer(  src, dest)
{
    var r1, r2, Y=src.Y, X=src.X;
    var offset, offsetxm1, offsetxp1, offsetym1, offsetyp1;

    copyTemp(src);

    for (var y=0; y<Y; y++)
    {
        offsetym1=pmod(y-1, Y)*X;
        offset=y*X;
        offsetyp1=((y+1) % Y)*X;
        for (var x=0; x<X; x++)
        {
            offsetxm1=pmod(x-1, X);
            offsetxp1=((x+1) % X);
            r1=128
                -TEMPL[offsetxm1+offsetym1].r
                -TEMPL[offsetxm1+offset].r
                -TEMPL[offsetxm1+offsetyp1].r
                +TEMPL[offsetxp1+offsetym1].r
                +TEMPL[offsetxp1+offset].r
                +TEMPL[offsetxp1+offsetyp1].r;
//            g1=128
//                -TEMPL[offsetxm1+offsetym1].g
//                -TEMPL[offsetxm1+offset].g
//                -TEMPL[offsetxm1+offsetyp1].g
//                +TEMPL[offsetxp1+offsetym1].g
//                +TEMPL[offsetxp1+offset].g
//                +TEMPL[offsetxp1+offsetyp1].g;
//            b1=128
//                -TEMPL[offsetxm1+offsetym1].b
//                -TEMPL[offsetxm1+offset].b
//                -TEMPL[offsetxm1+offsetyp1].b
//                +TEMPL[offsetxp1+offsetym1].b
//                +TEMPL[offsetxp1+offset].b
//                +TEMPL[offsetxp1+offsetyp1].b;
            r2=128
                -TEMPL[offsetym1+offsetxm1].r
                -TEMPL[offsetym1+x].r
                -TEMPL[offsetym1+offsetxp1].r
                +TEMPL[offsetyp1+offsetxm1].r
                +TEMPL[offsetyp1+x].r
                +TEMPL[offsetyp1+offsetxp1].r;
//            g2=128
//                -TEMPL[offsetym1+offsetxm1].g
//                -TEMPL[offsetym1+x].g
//                -TEMPL[offsetym1+offsetxp1].g
//                +TEMPL[offsetyp1+offsetxm1].g
//                +TEMPL[offsetyp1+x].g
//                +TEMPL[offsetyp1+offsetxp1].g;
//            b2=128
//                -TEMPL[offsetym1+offsetxm1].b
//                -TEMPL[offsetym1+x].b
//                -TEMPL[offsetym1+offsetxp1].b
//                +TEMPL[offsetyp1+offsetxm1].b
//                +TEMPL[offsetyp1+x].b
//                +TEMPL[offsetyp1+offsetxp1].b;
            r1=Math.sqrt((r1*r1+r2*r2))
//            g1=min(OA,sqrt((g1*g1+g2*g2)))
//            b1=min(OA,sqrt((b1*b1+b2*b2)))

            var p = dest[x+offset]
            p.b=p.g=p.r=r1;
//            p.g=g1;
//            p.b=b1;
        }
    }
}

function Layer(sizeX,sizeY) {
    var tmp = [];
    tmp.XY = sizeX*sizeY;
    for (var i=0;i<tmp.XY; i++) tmp[i] = new RGBA()
    tmp.X = sizeX;
    tmp.Y = sizeY;
    return tmp;
}


function fromLayer(_layer, _setPixel) {
    return function(c) {
        var imgData=c.createImageData(S,S);
        var d = imgData.data;
        for (var i=0;i<d.length;i+=4) {
            var p = _layer[i/4];
            _setPixel(d,i, p.r, p.g, p.b, p.a)
        }
        c.putImageData(imgData,0,0);
    }
}

function up(x,by) {
    return min(OA, x*(1+(by-2)/5));
}

S= 128
TEMPL = Layer(S,S)
stones = [];
for (i=0; i<3;i++) {
    var L = Layer(S,S)
    perlinNoise(L,  64, 0, 256, 150, 6)
    embossLayer(L, L);
    stones[i] = r2c(S,S, fromLayer(L, function(d,x, r, g, b, a) {
        setPixel(d,x, up(r,i), up(g,i), up(b,i),a)
    })
    )
}



D=20
grass = r2c(D,D, function(c) { noise(c, D,D, 80,20, 180,40, 80,40)})
dirt1 = r2c(D,D, function(c) { noise(c, D,D, 120,20, 110,20, 40,30)})
dirt2 = r2c(D,D, function(c) { noise(c, D,D, 140,25, 120,25, 50,40)})


function texturecube(x,y,w,h,d, tright,tfront, ttop) {
    // front
    y-=h;
    trns(1, 0,0,1, x,y)    // hsc,hsk,vsk,vsc,x,y
    c.drawImage(tfront, 0,0, w,h);

//    if (p > 0) {
        // right
    p = .5
    trns(p, -p,0,1,x+w,y)
    c.drawImage(tright, 0,0, d,h);

    // top
    trns(1, 0,-p, p,x+0.5 +p*d,y-p*d)
    c.drawImage(ttop, 0,0,w,d);

//    }
//    else {
//        // left
//        trns(p, p,0,1,x,y)
//        c.drawImage(dirt2, 0,0, d,h);
//
//        // top
//        trns(1, 0,-p, -p,x-0.5 +p*d,y+p*d)
//        c.drawImage(grass, 0,0,w,d);
//    }
}



cubes = []
drawcubes = function() {
    for (i=0; i<cubes.length; i++)
        cubes[i].draw();
}

function addCube(x,y,z, w,h,d, borders, borderColor, brickWidth, draw) {
    cubes.push({
        wx:x, // world x
        wy:y,
        wz:z,
        b:borders,
        bc:borderColor,
        bw:brickWidth,
        sx:x+y/2,     // screen x
        sy:height-y/2-h-z,
        w:w, h:h, d:d,
        draw: draw
    })
}

function brickDraw() {
    //  Borders
    //      ___ 7 ____
    //    8/        6/|
    //    /         / |
    //   +--- 2 ---+  |5
    //   |         |  |
    //   3         1  /
    //   |         | /4
    //   +--- 0 ---+/

    var $=this,x= $.sx,y= $.sy,w= $.w,h= $.h,d= $.d, b= $.b, bw= $.bw, bh=bw*.3;

    // top
    trns(1, 0,-.5,.5,x+0.5 +.5*d,y-.5*d)
    brick(c, w, d, bw,bh, "#e86", "#eda");
    if (b) {
        c.strokeStyle = $.bc;
        c.beginPath();
        if (b&256) {
            c.moveTo(0,0)
            c.lineTo(0,d)
        }
        if (b&128) {
            c.moveTo(0,0)
            c.lineTo(w,0)
        }
        c.stroke()
    }

    // front
    trns(1, 0,0,1, x,y)
    brick(c, w,h, bw,bh, "#d74", "#dc8")
    if (b) {
        c.strokeStyle = $.bc;
        c.beginPath();
        if (b&4) {
            c.moveTo(0,0)
            c.lineTo(w,0)
        }
        if (b&2) {
            c.moveTo(w,0)
            c.lineTo(w,h)
        }
        if (b&1){
            c.moveTo(w,h)
            c.lineTo(0,h)
        }
        if (b&8){
            c.moveTo(0,h)
            c.lineTo(0,0)
        }
        c.stroke()
    }
    // right
    trns(.5, -.5,0,1,x+w,y)
    brick(c, d,h,bw,bh, "#b52", "#ba6")

    if (b) {
        c.strokeStyle = $.bc;
        c.beginPath();
        if (b& 64) {
            c.moveTo(0,0)
            c.lineTo(d,0)
        }
        if (b& 32) {
            c.moveTo(d,0)
            c.lineTo(d,h)
        }
        if (b&16){
            c.moveTo(d,h)
            c.lineTo(0,h)
        }
//        if (b&128){
//            c.moveTo(0,h)
//            c.lineTo(0,0)
//        }
        c.stroke()
    }

}

BBC = "rgba(15, 15, 15, 0.3)" // brick border color

function fourWall(x,y,z,w,h,d,wd, draw) {  // wd = wall thickness
    // left
    addCube(x, y+wd, z, wd,h,d-wd, 0x1df, BBC, 30, draw)
    // back
    addCube(x+wd, y+d-wd, z, w-2*wd,h,wd, 0x1f7, BBC,28, draw)
    // right
    addCube(x+w-wd, y+wd, z, wd,h,d-wd, 0x1ff, BBC,30, draw)
    // front
    addCube(x, y, z, w,h,wd, 0x1df, BBC,30, draw)
}

function turret(x,y,z,w,h,d,wd, th,tw, tgap, bw, draw) {
    fourWall(x,y,z,w,h,d,wd, draw);
    // back
    for (var xx=x; xx<=x+w-tw; xx+=tw+tgap) {
        addCube(xx, y+d-wd, z+h-1, wd, th, tw, 0x1fe, BBC,bw *.9, draw);
    }
    for (var yy=y+d-wd; yy>y; yy-= tw+tgap) {
        addCube(x, yy, z+h, wd, th, tw, 0x1ef, BBC,bw,draw);
        addCube(x+w-wd, yy, z+h, wd, th, tw, 0x1ef, BBC,bw,draw);
    }
    for (var xx=x; xx<=x+w-tw; xx+=tw+tgap) {
        addCube(xx, y, z+h-1, wd, th, tw, 0x1fe, BBC,bw, draw);
    }

}

addCube(50,50,600,   20, 20, 20,  0x1, "#ff0", 15, brickDraw)
addCube(100,50,600,  20, 20, 20,  0x2, "#ff0", 15,  brickDraw)
addCube(150,50,600,  20, 20, 20,  0x4, "#ff0", 15, brickDraw)
addCube(200,50,600,  20, 20, 20,  0x8, "#ff0", 15, brickDraw)
addCube(250,50,600,  20, 20, 20, 0x10, "#ff0", 15, brickDraw)
addCube(300,50,600,  20, 20, 20, 0x20, "#ff0", 15, brickDraw)
addCube(350,50,600,  20, 20, 20, 0x40, "#ff0", 15, brickDraw)
addCube(400,50,600,  20, 20, 20, 0x80, "#ff0", 15, brickDraw)
addCube(450,50,600,  20, 20, 20,0x100, "#ff0", 15, brickDraw)

// back tower
addCube(255,650,0,   90, 200, 90, 0x1fe, BBC, 27, brickDraw)
turret(220,610,200,  160, 45, 160, 17,  17, 17.5, 17.5, 27, brickDraw)
// mid section wall
turret(280,250,0,    50, 100, 400, 20,  20, 20, 20, 30, brickDraw)
// front tower
addCube(250,150,0,   100, 200, 100, 0x1fe, BBC, 33, brickDraw)
turret(210,110,200,  180, 50, 180, 20,  20, 20, 20, 33, brickDraw)



//hsc = 1, hsk =0,vsk=0,vsc=1,X=450,Y=550, W=100, H=20
//p= -.5
//function setup(a,b,c,d) {
//    hsc = a; hsk=b; vsk=c; vsc=d;
//}
t = 0;
function tick() {
    t++;
    c.save()
    c.fillStyle = "#CDF";
    trns(1,0,0,1,0,0);
    c.fillRect(0,0,width,height);

    drawcubes()

    texturecube(600, 570, 100, 20, 100, dirt1, dirt2, grass);
    texturecube(750, 600, 100, 20, 100, dirt1, dirt2, grass);

    texturecube(50, 500, 80, 120, 100, stones[0],stones[1],stones[2]);
    c.restore()

//    coins.init();
//    for (i in coins.d) {
//        coins.draw(coins.d[i])
//    }
//    c.restore()

//    trns(hsc, hsk,vsk,vsc,X,Y)
//    c.drawImage(dirt2, 0,0, W,H);

//    rq(tick)
}
rq(tick);
