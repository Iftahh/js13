IPY=50;Y=0;
IPX=60;IPZ=20; /* ID: svg_6 */
BW=27
B=0x1fe
BC=BBC
DR=texturecube
B=0x1ff

W=40,H=10,D=W
range(200, function(i) {
    for (j=5;j>-5;j--) {
        X=i*D,Y=j*D,Z=irnd(-H,0)//5+4*cos(TPI*i/10)+6*cos(TPI*(5+j)/8)
        addSprite()
    }
})


DR=brickDraw

// pyramid
// x1,y1,z1,w1,d1,x2,y2,w2,d2, h,n
//stairs(-300+100,200+100,0,250,250,  -300+220,200+220,10,10,4,30)

stairs(600, 200, 0, 400,100,  2600,200,100,100,  14, 10)

// CASTLE
X=255,Y=450,Z=0, W=90,H=200,D=90
// back tower
addSprite()
// x,y,z, w,h,d, wd,th,tw, tgap, bw
turret(220,410,200,  160,45,160,  18, 12,18,  17.5, 27)

// mid section wall
turret(280,250,0,    50, 100, 200, 20,  14, 20, 20, 30)

//csprites = frontSprites;
//turret(280,250,0,    50, 100, 200, 20,  14, 20, 20, 30)

// front tower
//BW=33,B=0x1fe,X=250,Y=150,Z=0,W=100,H=200,D=100
//addSprite()
//range(5, function() {X+=W; addSprite(); })
//turret(210,110,200,  180, 50, 180, 20,  16, 20, 20, 33)

///////// end of castle

//stairs(100,100,0,250,100, 300,100,50,100, 20,5)

for (i=0; i<10; i++) {
    addCoin(rnd()*700+50, rnd()*500+50)
}

// TODO: addSprite should get the params...  at least X,Z,W,H
