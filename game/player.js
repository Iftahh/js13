var KEYS={}
var updateFromKeys = function(e) {
    KEYS[e.keyCode]=  e.type == "keydown";
    Player.left = KEYS[37];
    Player.right = KEYS[39];
    Player.up = KEYS[38];
    Player.down = KEYS[40];
    Player.jump = KEYS[32];
    if (e.keyCode == 32 || e.keyCode >=37 && e.keyCoe <= 40)
        e.preventDefault();
}
DC.addEventListener('keydown', updateFromKeys)
DC.addEventListener('keyup', updateFromKeys)

DC.body.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, false);



Tch.fillStyle = RGB(140,150,240,.5);
Tch.shadowColor = RGB(170,180,250,.5);
Tch.shadowBlur = 30;
Tch.lineWidth = 7;
Tch.strokeStyle = RGB(80,90,140,.5);

var TchCan = canvases[2];
TchCan.addEventListener('touchstart', function(event) {
    var ct =  event.changedTouches;
    var jsMove = null;
    var jsButton = null;
    each(ct, function($) {
        var x = $.clientX- TchCan.offsetLeft;
        var y = $.clientY-TchCan.offsetTop;
        if (x < width/2 - 20) {
            jsMove = [$.identifier, x,y];
        }
        else if (x > width/2 + 20) {
            jsButton = [$.identifier, x,y];
        }
    })
    if (jsMove != null) {
        joystickMove(jsMove);
    }
    if (jsButton != null) {
        joystickButton(jsButton)
    }
    event.preventDefault();
});

var joystickMove = function(jsMove) {
    joystick.move = jsMove;
    var x = jsMove[1];
    var y = jsMove[2];
    Tch.clearRect(0,0,width/2,height);
    Tch.beginPath();
    Tch.arc(joystick.x, joystick.y, 20, 0, TPI);
    Tch.moveTo(joystick.x, joystick.y);
    Tch.lineTo(x, y);
    Tch.arc(x,y, 35, 0, TPI);
    Tch.stroke();
    Tch.fill();
    if (x < joystick.x-15) {
        Player.left = 1;
        Player.right = 0;
        Player.up = 0;
        Player.down = 0;
    }
    else if (x > joystick.x +15) {
        Player.left = 0;
        Player.right = 1;
        Player.up = 0;
        Player.down = 0;
    }
    else {
        Player.left = 0;
        Player.right = 0;
    }

    if (!Player.left && !Player.right) {
        if (y < joystick.y-15) {
            Player.up = 1;
            Player.down = 0;
        }
        else if (y > joystick.y +15) {
            Player.up = 0;
            Player.down = 1;
        }
        else {
            Player.up = 0;
            Player.down = 0;
        }
    }
    event.preventDefault();
}

var joystickButton=function(button) {
    Player.jump = 1;
    joystick.button= button;
    Tch.clearRect(width/2,0,width/2,height);
    Tch.beginPath()
    Tch.arc(button[1],button[2], 35, 0, TPI);
    Tch.fill();
}

TchCan.addEventListener('touchmove', function(event) {
    var ct =  event.changedTouches;
    var jsMove = null;
    var jsButton = null;
    each(ct, function($) {
        var x = $.clientX- TchCan.offsetLeft;
        var y = $.clientY-TchCan.offsetTop;
        if (x < width/2 - 20) {
            jsMove = [$.identifier, x,y];
        }
        else if (x > width/2 + 20) {
            jsButton = [$.identifier, x,y];
        }
    })
    if (jsMove != null) {
        joystickMove(jsMove)
    }
    if (jsButton != null) {
        joystickButton(jsButton)
    }
    event.preventDefault();
});

TchCan.addEventListener('touchend', function(event) {
    var ct =  event.changedTouches;
    each(ct, function($) {
        if (joystick.move != null && $.identifier == joystick.move[0]) {
            joystick.move = null;
            Player.left = 0;
            Player.right = 0;
            Player.up = 0;
            Player.down = 0;
            Tch.beginPath();
            Tch.clearRect(0,0,width/2,height);
            Tch.arc(joystick.x, joystick.y, 30, 0, TPI);
            Tch.fill()
        }
        if (joystick.button != null && $.identifier == joystick.button[0]) {
            joystick.button = null;
            Player.jump = 0;
            Tch.clearRect(width/2,0,width/2,height);
        }
    });
});

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

var speedUpdate=function($,dt) {
    $.vz-= .2*dt; // Gravity accelerates down
    var realVx = $.vx;
    var realVz = $.vz;
    if ($.floor && $.floor.sprite.vx && abs($.floorZ - $.floor.z - P2R4)<4) {
        realVx += $.floor.sprite.vx;
        realVz += $.floor.sprite.vz;
    }
    $.x+=realVx*dt;
    $.z+=realVz*dt;


}

var playerUpdate = function($, dt) {
//    if (KEYS[38]) {VY=min(3,VY+.1)}  // up
//    else if (KEYS[40]) {VY=max(-3,VY -.1)} // down
//    else VY=VY*.9

    var left = $.left, right=$.right, jump=$.jump;

    var speedup = .15*dt;
    if (left) {$.vx -= speedup} // left   -
    else if (right) {$.vx+= speedup}  // right
    else $.vx *= Math.pow(.9,dt)

    var maxSpeed = jump? 3.5: 2.5;//  hack: max speed is higher if space is pressed
    if (abs($.vx) > maxSpeed ) {
        var slowdown = Math.pow(.95, dt)
        if ($.vx<0) {$.vx = min($.vx *slowdown, -maxSpeed)}
        else { $.vx=max($.vx *slowdown, maxSpeed)}
    }


    speedUpdate($,dt)

    //MAX_PZ = max(MAX_PZ, PZ)
    //H=P2R;

//    PY+=VY; // Changed my mind: no collision with front and back of cubes
//    wall = collide(PX-P2R,PY+PR,PZ, P2R, VY>0 ? CB: CF );
//    if (wall) {
//        PY-= VY;
//        VY= -VY*.8;
//    }


    if ($.vz>0) {
        wall = collide($.x,$.y,$.z, PR, CollisionBottomFace ); // collide top
        if (wall) {
            bounceWall.play()
            $.z = wall.z - PR;  // $.z -= $.vz;
            $.vz *= -.8;
        }
    }

    if ($.z < -2000) {
        initPlayer()
    }


    var floor = findFloor($.x,$.y,$.z, PR);
    $.floorZ = -Infinity;
    if (floor.d ) { // real floor should have D dimension
        $.floor = floor;
        $.floorZ = floor.z + P2R4;
        if ($.z <= $.floorZ ||  // hit floor
            (!$.floor.sprite.spikes && jump && $.z-$.floorZ < 5 && abs($.vz) < 2)) {

            if ($.floor.sprite.spikes && $.vz<0) {
                initPlayer();
                return
            }

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
    else {
        $.floor = false;
    }

    var wall = collide($.x,$.y,$.z, PR, $.vx>0 ? CollisionLeftFace: CollisionRightFace ); // collide left and right
    if (wall) {
        $.x = $.vx>0 ?  wall.x-PR : wall.x+wall.w+PR //$.x-= $.vx;
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


    toScreenSpace($)
    $.sx -= P2R4;
    $.sy -= P2R4/2;

    if (left || right)
        CameraX = ($.sx - width *(.5 - $.vx / 20));

    if ($.up)
        $.uplook -= .01;
    if ($.down)
        $.uplook += .01;
    if ($.up || $.down)
        $.uplook = min(max($.uplook, -.5),.5)
    else
        $.uplook = min(max($.uplook, -.1),.1)

    CameraY = $.sy - height *(.5 - $.uplook);
}

var playerDraw=function(){ // TODO: inline

    // DRY with enemy
    // TODO: make horizontal ellipse when crashes down with speed to floor,  make vertical ellipse when flying up quick and/or at the top of jump
    drawBall(Player )
}

var cacheBallImg = function(w,h, $, isLeft) {
    return r2c(w,h, function(c) {
        var r = $.radius;
        c.translate(r,r);
        c.lineWidth=1;
        c.strokeStyle="#111";
        c.fillStyle = $.color;
        c.beginPath();
        c.arc(0, 0, r, 0, TPI);
        c.fill();
        c.scale(isLeft ? 1: -1, 1);
        c.fillStyle = "#222"
        c.fillText($.face,-15,1)
        c.fillText($.mouth, $.mx, $.my)
        c.stroke()
    })
}





var drawBall = function($) {
    // shadow
    C.save();
    if ($.floorZ > -10e6) {
        var sy = $.sy - $.floorZ + $.z;
        trns(1,0,0,.3, $.sx+ $.radius-4, sy+2* $.radius-1);
        C.beginPath()
        C.arc(0, 0, $.radius, 0, TPI);
        C.fillStyle = shadowColor;
        C.fill();
    }

    trns(1,0,0,1, $.sx, $.sy);
    // ball
    C.drawImage($.vx < 0 ? $.leftImg : $.rightImg, 0,0)

    C.restore()
}

var rightPlayerImg, leftPlayerImg = false;
var Player = {};


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
        update: playerUpdate,
        uplook: -.2
    })
    if (!leftPlayerImg) {
        leftPlayerImg = cacheBallImg(P2R, P2R, Player, true);
        rightPlayerImg =  cacheBallImg(P2R, P2R, Player, false);
    }
    Player.leftImg = leftPlayerImg;
    Player.rightImg = rightPlayerImg;

    toScreenSpace(Player)
    CameraX = Player.sx - width *.5;
    CameraY = Player.sy - height *.7;
}



addSprite(Player)
