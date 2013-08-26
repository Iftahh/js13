

grd = C.createRadialGradient(12, -7, 3, 12, -7, 30);
// light blue
grd.addColorStop(0, '#8ED6FF');
// dark blue
grd.addColorStop(1, '#004CB3');

PR=15
P2R=2*PR
initPlayer = function() {
    PX = 50
    PY = 100
    PZ = 50
    VX=VY = VZ = 0
}
initPlayer()

player=function(){ // TODO: inline
    if (KEYS[38]) {VY=min(3,VY+.1)}  // up
    else if (KEYS[40]) {VY=max(-3,VY -.1)} // down
    else VY=VY*.9

    if (KEYS[37]) {VX=max(-2.5-KEYS[32],VX -.15)} // left
    else if (KEYS[39]) {VX=min(2.5+KEYS[32],VX +.15)}  // right
    else VX=VX*.9

    PX+=VX;
    H=P2R;
    var wall = collide(PX-P2R,PY,PZ, P2R, VX>0 ? CL: CR );
    if (wall) {
        PX-= VX;
        VX= -VX*.8;
    }

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
        if (KEYS[32]) VZ=max(abs(VZ/2),6); else VZ=max(max(abs(VZ/2),abs(VX)/1.5),abs(VY)/1.5)// space
    }

    X=PX;Y=PY;Z=PZ;ts();

//}
//drawPlayer = function() {
    // draw player

    // TODO: make horizontal ellipse when crashes down with speed to floor,  make vertical ellipse when flying up quick and/or at the top of jump
    // shadow
    PSX=SX,PSY=SY;
    Z=floor.z;ts();
    C.save();
    trns(1,0,0,.3, SX-4,SY+PR+5);
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
