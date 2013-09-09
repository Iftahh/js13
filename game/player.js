var KEYS={32:0}
DC.addEventListener('keydown', function(e){
    KEYS[e.keyCode]=1;
    Player.left = KEYS[37];
    Player.right = KEYS[39];
    Player.jump = KEYS[32]
})
DC.addEventListener('keyup', function(e){
    KEYS[e.keyCode]=0;
    Player.left = KEYS[37];
    Player.right = KEYS[39];
    Player.jump = KEYS[32]
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


//var playerColor =  "#3084C4";
var playerColor  = C.createRadialGradient(12, -7, 3, 12, -7, 28);
// light blue
playerColor.addColorStop(0, '#8ED6FF');
// dark blue
playerColor.addColorStop(1, '#004CB3');

//setCameraX = function(a) { CameraX = min(wx2, max(wx1,a));}
var PR=20       // player radius
var P2R=2*PR
var P2R4=P2R/4


var bounceFloor = jsfxr([0,,0.1453,,0.225,0.3726,,0.12,0.22,,,,,0.1547,,,,,1,,,,,0.35])
var smallBounceFloor = jsfxr([0,,0.1,,0.22,0.3726,,0.14,0.2,,,,0.12,0.1547,,,,,1,,,,,0.26])
var bounceWall = jsfxr([0,,0.11,0.16,0.09,0.227,0.04,-0.18,0.34,,,,,0.23,0.12,,,,1,0.2,0.16,0.1,,0.32])

//MAX_PZ = -Infinity

var shadowColor = RGB(15,15,15,0.5)

var playerUpdate = function($) {
//    if (KEYS[38]) {VY=min(3,VY+.1)}  // up
//    else if (KEYS[40]) {VY=max(-3,VY -.1)} // down
//    else VY=VY*.9

    var left = $.left, right=$.right, jump=$.jump;

    if (left) {$.vx -= .15} // left   -
    else if (right) {$.vx+= +.15}  // right
    else $.vx *= .9

    var maxSpeed = 2.5+jump;//  hack: max speed is higher if space is pressed
    if (abs($.vx) > maxSpeed) {
        if (left) {$.vx = min($.vx *.95, -maxSpeed)}
        else if (right) { $.vx=max($.vx *.95, maxSpeed)}
    }

    $.x+=$.vx;
    $.vz-= .2 // Gravity accelerates down
    $.z+=$.vz;

    //MAX_PZ = max(MAX_PZ, PZ)
    H=P2R;

//    PY+=VY; // Changed my mind: no collision with front and back of cubes
//    wall = collide(PX-P2R,PY+PR,PZ, P2R, VY>0 ? CB: CF );
//    if (wall) {
//        PY-= VY;
//        VY= -VY*.8;
//    }


    if ($.vz>0) {
        wall = collide($.x,$.y,$.z, PR, CollisionBottomFace ); // collide top  - todo change to work with $ for both enemy and player
        if (wall) {
            bounceWall.play()
            $.z -= $.vz;
            $.vz *= -.8;
        }
    }

    if ($.z < -2000) {
        initPlayer()
    }


    var floor = findFloor($.x,$.y,$.z, PR); // todo change to work with $ for both enemy and player
    $.floorZ = -Infinity;
    if (floor.d ) { // real floor should have D dimension
        $.floorZ = floor.z + P2R4;
        if ($.z <= $.floorZ ||  // hit floor
        (jump && $.z-$.floorZ < 5 && abs($.vz) < 2)) {
        if ($.vz < -2 || jump)
            bounceFloor.play();
        else if ($.vz < -1)
            smallBounceFloor.play()

        $.z =$.floorZ;
        if (jump)
            $.vz=max(abs($.vz/2),6); // jump on touch floor
        else
            $.vz=max(abs($.vz/2),abs($.vx)/1.5) // bounce back from fall or  running bounce (ie. bounce when walking)
    }

    }

    var wall = collide($.x,$.y,$.z, PR, $.vx>0 ? CollisionLeftFace: CollisionRightFace ); // collide left and right
    if (wall) {
        $.x-= $.vx;
        bounceWall.play();
        if ($.z-$.floorZ > 10) {
            // collide while in jump - hardly bouncing back to make it easier to jump onto platforms
            $.vx *= -.2;
        }
        else {
            // collide on ground - bounce back
            $.vx *= -.8;
        }
    }

    //if (abs(VX) < 0.05) VX = 0;

    toScreenSpace($)
    $.sx -= P2R4;
    $.sy -= P2R4/2;

    if (left || right)
        CameraX = ($.sx - width *(.5 - $.vx / 20));

    CameraY = $.sy - height *.7;
}

var playerDraw=function(){ // TODO: inline

    // DRY with enemy
    // TODO: make horizontal ellipse when crashes down with speed to floor,  make vertical ellipse when flying up quick and/or at the top of jump
    drawBall(Player )
}

// Assumes X,Y,H are set already
var drawBall = function($) {
    // shadow
    if ($.floorZ > -10e6) {
        var sy = $.sy - $.floorZ + $.z;
        C.save();
        trns(1,0,0,.3, $.sx+ $.radius-4, sy+2* $.radius-1);
        C.beginPath()
        C.arc(0, 0, $.radius, 0, TPI);
        C.fillStyle = shadowColor;
        C.fill();
    }

    // ball
    trns(1,0,0,1, $.sx+ $.radius, $.sy+ $.radius);
    C.lineWidth=1;
    C.strokeStyle="#111";
    C.fillStyle = $.color;
    C.beginPath();
    C.arc(0, 0, $.radius, 0, TPI);
    C.fill();
    C.scale($.vx<0 ? 1: -1, 1);
    C.fillStyle = "#222"
    C.fillText($.face,-15,1)
    C.fillText($.mouth, $.mx, $.my)
    C.stroke()
    C.restore()
}

var Player = {}

var initPlayer = function() {
    update(Player, {
        x: IPX+P2R4,
        y: IPY+P2R4,
        z: IPZ+P2R4,
        vx:0,
        vy:0,
        vz:0,
        h:PR,
        w:PR,
        d:PR,
        sw:P2R,
        sh:P2R,
        radius: PR,
        draw: playerDraw,
        color:playerColor,
        face:"｡◕  ◕｡",
        mouth: "‿",
        mx:-5, // mouth offset
        my:5,
        update: playerUpdate
    })
    toScreenSpace(Player)
    CameraX = Player.sx - width *.5;
    CameraY = Player.sy - height *.7;
}

initPlayer()
// Player isn't added - he has special treatment because he can move in the queue of the rendering
//addSprite(Player)
