var KEYS={32:0}
DC.addEventListener('keydown', function(e){
    KEYS[e.keyCode]=1
})
DC.addEventListener('keyup', function(e){
    KEYS[e.keyCode]=0
})


// at this stage the level should be set - check the max and min coordinates and use it to set world boundaries
//wx1=wy1 = Infinity;
//wx2=wy2 = -Infinity;
//each(backSprites, function($) {
//    wx1 = min($.sx,wx1);
//    wy1 = min($.sy,wy1);
//    wx2 = max($.sx+ $.w, wx2);
//    wy2 = max($.sy+ $.h, wy2);
//})
//log("Level packed in ("+wx1+","+wy1+")  to ("+wx2+","+wy2+")")

var playerColor = C.createRadialGradient(12, -7, 3, 12, -7, 28);
// light blue
playerColor.addColorStop(0, '#8ED6FF');
// dark blue
playerColor.addColorStop(1, '#004CB3');

//setCameraX = function(a) { CameraX = min(wx2, max(wx1,a));}
var PR=20       // player radius
var P2R=2*PR
var P2R3=P2R/3
var P2R4=P2R/4

var Player = {}


var initPlayer = function() {
    Player = {
        x: IPX,
        y: IPY,
        z: IPZ,
        vx:0,
        vy:0,
        vz:0,
        h:P2R
    }
    $ts(Player)
    CameraX = Player.sx - width *.5;

    CameraY = Player.sy - height *.7;
}

initPlayer()

var bounceFloor = jsfxr([0,,0.1453,,0.225,0.3726,,0.12,0.22,,,,,0.1547,,,,,1,,,,,0.35])
var smallBounceFloor = jsfxr([0,,0.1,,0.22,0.3726,,0.14,0.2,,,,0.12,0.1547,,,,,1,,,,,0.26])
var bounceWall = jsfxr([0,,0.11,0.16,0.09,0.227,0.04,-0.18,0.34,,,,,0.23,0.12,,,,1,0.2,0.16,0.1,,0.32])

//MAX_PZ = -Infinity

var shadowColor = RGB(15,15,15,0.5)

var playerUpdate = function() {
//    if (KEYS[38]) {VY=min(3,VY+.1)}  // up
//    else if (KEYS[40]) {VY=max(-3,VY -.1)} // down
//    else VY=VY*.9

    left = KEYS[37];
    right = KEYS[39];
    if (left) {Player.vx -= .15} // left   -
    else if (right) {Player.vx+= +.15}  // right
    else Player.vx *= .9

    var maxSpeed = 2.5+KEYS[32];//  hack: max speed is higher if space is pressed
    if (abs(Player.vx) > maxSpeed) {
        if (left) {Player.vx = min(Player.vx *.95, -maxSpeed)}
        else if (right) { Player.vx=max(Player.vx *.95, maxSpeed)}
    }

    Player.x+=Player.vx;
    Player.vz-= .2 // Gravity accelerates down
    Player.z+=Player.vz;

    //MAX_PZ = max(MAX_PZ, PZ)
    H=P2R;

//    PY+=VY; // Changed my mind: no collision with front and back of cubes
//    wall = collide(PX-P2R,PY+PR,PZ, P2R, VY>0 ? CB: CF );
//    if (wall) {
//        PY-= VY;
//        VY= -VY*.8;
//    }


    if (Player.vz>0) {
        wall = collide(Player.x+P2R4,Player.y+P2R4,Player.z+P2R4, PR, CollisionBottomFace ); // collide top  - todo change to work with $ for both enemy and player
        if (wall) {
            bounceWall.play()
            Player.z -= Player.vz;
            Player.vz *= -.8;
        }
    }

    if (Player.z < -2000) {
        initPlayer()
    }

    Player.floor = findFloor(Player.x+P2R4,Player.y+P2R4,Player.z+P2R4, PR); // todo change to work with $ for both enemy and player
    if (Player.z <= Player.floor.z) {// bounce
        if (Player.vz < -2 || KEYS[32])
            bounceFloor.play();
        else if (Player.vz < -1)
            smallBounceFloor.play()

        Player.z =Player.floor.z;
        if (KEYS[32])
            Player.vz=max(abs(Player.vz/2),6);
        else
            Player.vz=max(abs(Player.vz/2),abs(Player.vx)/1.5)// space - jump on touch floor
    }

    var wall = collide(Player.x+P2R4,Player.y+P2R4,Player.z+P2R4, PR, Player.vx>0 ? CollisionLeftFace: CollisionRightFace ); // collide left and right
    if (wall) {
        Player.x-= Player.vx;
        bounceWall.play();
        if (Player.z-Player.floor.z > 10) {
            // collide while in jump - hardly bouncing back to make it easier to jump onto platforms
            Player.vx *= -.2;
        }
        else {
            // collide on ground - bounce back
            Player.vx *= -.8;
        }
    }

    //if (abs(VX) < 0.05) VX = 0;

    $ts(Player)

    if (left || right)
        CameraX = (Player.sx - width *(.5 - Player.vx / 20));

    CameraY = Player.sy - height *.7;
}

var playerDraw=function(){ // TODO: inline

    // DRY with enemy
    // TODO: make horizontal ellipse when crashes down with speed to floor,  make vertical ellipse when flying up quick and/or at the top of jump
    H = P2R;
    drawBall(Player.floor, Player.vx<0, Player.x,Player.y, Player.z, PR, playerColor,"｡◕  ◕｡", "‿",-5,5 )
}

// Assumes X,Y,H are set already
var drawBall = function(floor, left, x,y,z, radius, color, face, mouth, mx,my) {
    X=x;Y=y; // todo this was already set for player - but not for
    // shadow
    // TODO: use $ for both player and enenmy
    if (floor && floor.z > -10e6) {
        Z=floor.z;
        ts();
        C.save();
        trns(1,0,0,.3, SX+radius-4,SY+2*radius-1);
        C.beginPath()
        C.arc(0, 0, radius, 0, TPI);
        C.fillStyle = shadowColor;
        C.fill();
    }

    Z=z;
    ts()
    // ball
    trns(1,0,0,1, SX+radius,SY+radius);
    C.lineWidth=1;
    C.strokeStyle="#111";
    C.fillStyle = color;
    C.beginPath();
    C.arc(0, 0, radius, 0, TPI);
    C.fill();
    C.scale(left? 1: -1, 1);
    C.fillStyle = "#222"
    C.fillText(face,-15,1)
    C.fillText(mouth,mx,my)
    C.stroke()
    C.restore()
}
