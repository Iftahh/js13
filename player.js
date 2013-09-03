
// at this stage the level should be set - check the max and min coordinates and use it to set world boundaries
//wx1=wy1 = Infinity;
//wx2=wy2 = -Infinity;
//each(backSprites, function() {
//    wx1 = min($.sx,wx1);
//    wy1 = min($.sy,wy1);
//    wx2 = max($.sx+ $.w, wx2);
//    wy2 = max($.sy+ $.h, wy2);
//})
//console.log("Level packed in ("+wx1+","+wy1+")  to ("+wx2+","+wy2+")")

grd = C.createRadialGradient(12, -7, 3, 12, -7, 30);
// light blue
grd.addColorStop(0, '#8ED6FF');
// dark blue
grd.addColorStop(1, '#004CB3');

//setCameraX = function(a) { CameraX = min(wx2, max(wx1,a));}
PR=15
P2R=2*PR
initPlayer = function() {
    PX = IPX;
    PY = IPY;
    PZ = IPZ;
    VX=VY = VZ = 0
    CameraX=100 - width *.5
}
initPlayer()

player=function(){ // TODO: inline
    if (KEYS[38]) {VY=min(3,VY+.1)}  // up
    else if (KEYS[40]) {VY=max(-3,VY -.1)} // down
    else VY=VY*.9

    left = KEYS[37];
    right = KEYS[39];
    if (left) {VX=VX -.15} // left   -
    else if (right) {VX=VX +.15}  // right
    else VX*=.9

    var maxSpeed = 2.5+KEYS[32];//  hack: max speed is higher if space is pressed
    if (abs(VX) > maxSpeed) {
        if (left) {VX = min(VX *.95, -maxSpeed)}
        else if (right) { VX=max(VX *.95, maxSpeed)}
    }

    PX+=VX;
    H=P2R;
    var wall = collide(PX,PY,PZ, P2R, VX>0 ? CL: CR );
    if (wall) {
        PX-= VX;
        VX= -VX*.8;
    }

    if (abs(VX) < 0.05) VX = 0;

    PY+=VY; // TODO: collide front and back of cubes?
    wall = collide(PX-P2R,PY+PR,PZ, P2R, VY>0 ? CB: CF );
    if (wall) {
        PY-= VY;
        VY= -VY*.8;
    }

    VZ-= .2 // Gravity accelerates down
    PZ+=VZ;

    if (PZ < -2000) {
        initPlayer()
    }

    var floor = findFloor(PX,PY,PZ+PR);
    if (PZ <= floor.z) {// bounce
        PZ =floor.z;
        if (KEYS[32]) VZ=max(abs(VZ/2),6); else VZ=max(max(abs(VZ/2),abs(VX)/1.5),abs(VY)/1.5)// space - jump on touch floor
    }

    X=PX;Y=PY;Z=PZ;ts();

    PSX=SX,PSY=SY;

    if (left || right)
        CameraX = (PSX - width *(.5 - VX / 20));

//}
//drawPlayer = function() {
    // draw player

    // TODO: make horizontal ellipse when crashes down with speed to floor,  make vertical ellipse when flying up quick and/or at the top of jump
    // shadow

    Z=floor.z;ts();
    C.save();
    trns(1,0,0,.3, SX-4,SY+PR+1);
    C.arc(0, 0, 20, 0, TPI);
    C.fillStyle = RGB(15,15,15,0.5);
    C.shadowColor = RGB(15,15,15,0.5);
    C.shadowBlur = 25;
    C.fill();
    C.restore()

    // ball
    trns(1,0,0,1, PSX,PSY);
    C.beginPath();
    C.fillStyle = grd;
    C.arc(0, 0, 20, 0, TPI);
    C.fill();
    C.fillStyle=RGB(0,0,0,0)
    C.fillStyle = "#222"
    C.fillText("｡◕‿◕｡",-15,1)
    C.stroke()
    C.closePath()


}
