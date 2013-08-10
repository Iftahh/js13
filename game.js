

c = document.getElementById('c')
w = c.width;
h = c.height;
c = c.getContext('2d')
rnd = Math.random
abs = Math.abs
rq = requestAnimationFrame
floor = Math.floor
trns = function(a,b,p,d,e,f) { c.setTransform(a,b,p,d,e,f) }

TPI = 2*Math.PI;

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

function noise(c,w,h,r1,dr,g1,dg,b1,db) { //random noise texture
    var imgData=c.createImageData(w,h);
    for (var i=0;i<imgData.data.length;i+=4)
    {
        imgData.data[i+0]=r1+rnd()*dr;
        imgData.data[i+1]=g1+rnd()*dg;
        imgData.data[i+2]=b1+rnd()*db;
        imgData.data[i+3]=255;
    }
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
for (i=0; i<1; i++) {
    coins.d.push({x:rnd()*700+50, y:rnd()*500+50, t:floor(rnd()*100)})
}

function brickcube(x,y,w,h,d) {
    // front
    y-=h;
    trns(1, 0,0,1, x,y)
    brick(c, w,h,30,h/10, "#b52", "#ba6")
    // right
    trns(.5, -.5,0,1,x+w,y)
    brick(c, d,h,30,h/10, "#d74", "#dc8")

    // top
    trns(1, 0,-.5,.5,x+0.5 +.5*d,y-.5*d)
    brick(c, w, d, 30,d/10, "#e86", "#eda")
}



D=20
grass = r2c(D,D, function(c) { noise(c, D,D, 80,20, 180,40, 80,40)})
dirt1 = r2c(D,D, function(c) { noise(c, D,D, 120,20, 110,20, 40,30)})
dirt2 = r2c(D,D, function(c) { noise(c, D,D, 140,25, 120,25, 50,40)})


function grasscube(x,y,w,h,d, p) {
    // front
    y-=h;
    trns(1, 0,0,1, x,y)
    c.drawImage(dirt1, 0,0, w,h);
    // right
    trns(p, -p,0,1,x+w,y)
    c.drawImage(dirt2, 0,0, d,h);

    // top
    trns(1, 0,-p,p,x+0.5 +p*d,y-p*d)
    c.drawImage(grass, 0,0,w,d);
}


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

    c.restore()

    grasscube(600, 570, 100, 20, 100, .5);
    //grasscube(600, 600, 100, 20, 100, -.5);

    grasscube(150, 500, 80, 120, 100, .5);

    coins.init();
    for (i in coins.d) {
        coins.draw(coins.d[i])
    }
    c.restore()

    rq(tick)
}
rq(tick);
