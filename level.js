
BW=27
B=0x1fe
BC=BBC

DR=texturecube
B=0x1ff

W=40,H=10,D=W
for (i=0;i<200;i++) {
    for (j=20;j>0;j--) {
        X=i*D,Y=j*D,Z=irnd(0,H)//5+4*cos(TPI*i/10)+6*cos(TPI*(5+j)/8)
        addSprite()
    }
}


DR=brickDraw
// pyramid
//stairs(100,100,300,250,250, 200,200,50,50, 20,10)


// CASTLE
X=255,Y=650,Z=0, W=90,H=200,D=90
// back tower
addSprite()
// x,y,z, w,h,d, wd,th,tw, tgap, bw
turret(220,610,200,  160,45,160,  18, 12,18,  17.5, 27)

// mid section wall
turret(280,250,0,    50, 100, 400, 20,  14, 20, 20, 30)
// front tower
BW=33,B=0x1fe,X=250,Y=150,Z=0,W=100,H=200,D=100
addSprite()
turret(210,110,200,  180, 50, 180, 20,  16, 20, 20, 33)

///////// end of castle

//stairs(100,100,0,250,100, 300,100,50,100, 20,5)


