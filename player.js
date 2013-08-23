

grd = C.createRadialGradient(12, -3, 5, 12, -3, 40);
// light blue
grd.addColorStop(0, '#8ED6FF');
// dark blue
grd.addColorStop(1, '#004CB3');


PX = 50
PY = 100
PZ = 50
VX=VY = VZ = 0

player=function(){ // TODO: inline
    if (KEYS[38]) {VY=min(3,VY+.1)}  // up
    else if (KEYS[40]) {VY=max(-3,VY -.1)} // down
    else VY=VY*.9

    if (KEYS[37]) {VX=max(-3,VX -.1)} // left
    else if (KEYS[39]) {VX=min(3,VX +.1)}  // right
    else VX=VX*.9

    PX+=VX; PY+=VY;
    VZ-= .2 // Gravity accelerates down
    PZ+=VZ;
    if (PZ <= 0) {// bounce
        PZ =0;
        if (KEYS[32]) VZ=max(abs(VZ/2),6); else VZ=max(max(abs(VZ/2),abs(VX)),abs(VY))// space
    }

    X=PX;Y=PY;Z=PZ;H=30;ts();

    C.save();
    trns(1,0,0,.3, SX,SY+PZ+H/2+5);
    C.arc(0, 0, 20, 0, TPI);
    C.fillStyle = RGB(15,15,15,0.5);
    C.shadowColor = RGB(15,15,15,0.5);
    C.shadowBlur = 25;
    C.fill();
    C.restore()

    trns(1,0,0,1, SX,SY);
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
