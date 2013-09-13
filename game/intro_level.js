

IPX = 250
IPY = 50
IPZ= 0;

initPlayer();
BW=27;BC=BBC;
B = 0xfff;

loadLevel([])

DR=textureDraw
B=0x1ff

W=40,H=10,D=W
for (var j=3;j>-3;j--) {
    Y=j*D//5+4*cos(TPI*i/10)+6*cos(TPI*(5+j)/8)
    addBrokenCube(0,-H,W*100,H,10);
}

DR=brickDraw;

//

// CASTLE
Y=450; D=90;
// back tower
var towerBlock = addNonBlockCube(255,0, 90,200);
// x,y,z, w,h,d, wd,th,tw, tgap, bw
turret(220,410,200,  160,45,160,  18, 12,18,  17.5, 27)

// mid section wall
turret(280,250,0,    50, 100, 200, 20,  14, 20, 20, 30)
//


turret(280,250,0,    50, 100, 200, 20,  14, 20, 20, 30)

// front tower
turret(210,110,200,  180, 50, 180, 20,  16, 20, 20, 33)
//
