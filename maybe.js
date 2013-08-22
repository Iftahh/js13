// Stone texture


seedValue=rnd()
function myRandom()
{
    seedValue = (seedValue * 22695477 + 1) & 0xffffff;
    return (seedValue >> 16) & 0x7fff;
    //return Math.floor(Math.random()*301);
}

function RGBA(r,g,b)
{
    this.r=r;
    this.g=g;
    this.b=b;
    this.a=OA;
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

