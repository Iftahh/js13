

c = document.getElementById('c')
w = c.width;
h = c.height;
c = c.getContext('2d')
rnd = Math.random
abs = Math.abs
min = Math.min
cos= Math.cos
rq = requestAnimationFrame
floor = Math.floor
trns = function(hsc,hsk,vsk,vsc,x,y) { c.setTransform(hsc,hsk,vsk,vsc,x,y) }
OA = 255 // opaque alpha

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
        c.save()
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
        c.fill();
        c.fillStyle = "#aa6"
        if (d>L/2)
            c.fillText("1",-3,3.5)
        else
            c.fillText("\u265B",-5,3.5)
        c.stroke();
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

function RGBA(r,g,b,a)
{
    this.r=r||0;
    this.g=g||0;
    this.b=b||0;
    this.a=a||OA;
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

// brick texture at cavas c, of width and height,  bw = brick width, nr= num rows
function brick(c,w,h,bw,nr,c1,c2) {
    c.fillStyle = c1
    c.fillRect(0,0,w,h)
    c.strokeStyle = c2;
    row=0
    bh = h/nr
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

function brickcube(x,y,w,h,d) {
    // front
    y-=h;
    trns(1, 0,0,1, x,y)
    brick(c, w,h,30,h/10, "#d74", "#dc8")
    // right
    trns(.5, -.5,0,1,x+w,y)
    brick(c, d,h,30,h/10, "#b52", "#ba6")

    // top
    trns(1, 0,-.5,.5,x+0.5 +.5*d,y-.5*d)
    brick(c, w, d, 30,d/10, "#e86", "#eda")
}

function cosineInterpolate(v, x, y)
{
    var f1, f2, mf1, mf2, g0, g1, g2, g3, color;
    mf1=(1-cos(x*PI))*.5;
    mf2=(1-cos(y*PI))*.5;
    f1=1-mf1;
    f2=1-mf2;
    g0=f1*f2;
    g1=mf1*f2;
    g2=f1*mf2;
    g3=mf1*mf2;

    return new RGBA( v[0].r*g0+v[1].r*g1+v[2].r*g2+v[3].r*g3,
                  v[0].g*g0+v[1].g*g1+v[2].g*g2+v[3].g*g3,
                  v[0].b*g0+v[1].b*g1+v[2].b*g2+v[3].b*g3);
}


function subPlasma(layer, dist, seed, amplitude)
{
    var x, y, X=layer.X, Y=layer.Y, offset, offset2, corner = [], oodist;
    corner[0] =new RGBA();
    corner[1] =new RGBA();
    corner[2] =new RGBA();
    corner[3] =new RGBA();

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
            corner[0]=layer[x+offset];
            corner[1]=layer[((x+dist) % X)+offset];
            corner[2]=layer[x+offset2];
            corner[3]=layer[((x+dist) % X)+offset2];
            for (var b=0; b<dist; b++)
                for (var a=0; a<dist; a++)
                    layer[x+a+(y+b)*X]=cosineInterpolate(corner, oodist*a, oodist*b);
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

function embossLayer(  src, dest)
{
    var r1, g1, b1, r2, g2, b2, Y=src.Y, X=src.X;
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
            g1=128
                -TEMPL[offsetxm1+offsetym1].g
                -TEMPL[offsetxm1+offset].g
                -TEMPL[offsetxm1+offsetyp1].g
                +TEMPL[offsetxp1+offsetym1].g
                +TEMPL[offsetxp1+offset].g
                +TEMPL[offsetxp1+offsetyp1].g;
            b1=128
                -TEMPL[offsetxm1+offsetym1].b
                -TEMPL[offsetxm1+offset].b
                -TEMPL[offsetxm1+offsetyp1].b
                +TEMPL[offsetxp1+offsetym1].b
                +TEMPL[offsetxp1+offset].b
                +TEMPL[offsetxp1+offsetyp1].b;
            r2=128
                -TEMPL[offsetym1+offsetxm1].r
                -TEMPL[offsetym1+x].r
                -TEMPL[offsetym1+offsetxp1].r
                +TEMPL[offsetyp1+offsetxm1].r
                +TEMPL[offsetyp1+x].r
                +TEMPL[offsetyp1+offsetxp1].r;
            g2=128
                -TEMPL[offsetym1+offsetxm1].g
                -TEMPL[offsetym1+x].g
                -TEMPL[offsetym1+offsetxp1].g
                +TEMPL[offsetyp1+offsetxm1].g
                +TEMPL[offsetyp1+x].g
                +TEMPL[offsetyp1+offsetxp1].g;
            b2=128
                -TEMPL[offsetym1+offsetxm1].b
                -TEMPL[offsetym1+x].b
                -TEMPL[offsetym1+offsetxp1].b
                +TEMPL[offsetyp1+offsetxm1].b
                +TEMPL[offsetyp1+x].b
                +TEMPL[offsetyp1+offsetxp1].b;
            r1=Math.sqrt((r1*r1+r2*r2));
            g1=Math.sqrt((g1*g1+g2*g2));
            b1=Math.sqrt((b1*b1+b2*b2));
            if (r1>255) r1=255;
            if (g1>255) g1=255;
            if (b1>255) b1=255;

            var p = dest[x+offset]
            p.r=r1;
            p.g=g1;
            p.b=b1;
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


//hsc = 1, hsk =0,vsk=0,vsc=1,X=450,Y=550, W=100, H=20
//p= -.5
//function setup(a,b,c,d) {
//    hsc = a; hsk=b; vsk=c; vsc=d;
//}
t = 0;
function tick() {
    t++;
    c.fillStyle = "#111";
    trns(1,0,0,1,0,0);
    c.fillRect(0,0,w,h);


    c.save()
    c.fillStyle = "#111";
    trns(1,0,0,1,0,0);
    c.fillRect(0,0,w,h);

    brickcube(300, 450, 100,300,100);
    brickcube(400, 450, 50,100,300);


    texturecube(600, 570, 100, 20, 100, dirt1, dirt2, grass);
    texturecube(750, 600, 100, 20, 100, dirt1, dirt2, grass);

    texturecube(150, 500, 80, 120, 100, stones[0],stones[1],stones[2]);
    c.restore()

    coins.init();
    for (i in coins.d) {
        coins.draw(coins.d[i])
    }
    c.restore()

    c.drawImage(stones[0], 100, 100, S,S);

//    trns(hsc, hsk,vsk,vsc,X,Y)
//    c.drawImage(dirt2, 0,0, W,H);

   // rq(tick)
}
rq(tick);
