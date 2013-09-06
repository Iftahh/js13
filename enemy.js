


var enemies = []

var addEnemy = function(x,y) {
    var $ = {
        x:x, y:IPY,z:y,
        h: E2R,
        vx: -1,
        vz: 0,
    }
    $ts($)

    $.floor = findFloor($.x, $.y, $.z+E2R);
    if (DEBUG && !$.floor) {
        alert("Enemy must be above floor")
    }

    enemies.push($)
}

var enemyColor = C.createRadialGradient(15, -9, 3, 15, -9, 32);
// light red
enemyColor.addColorStop(0, '#FFD6CE');
// dark red
enemyColor.addColorStop(1, '#B34C80');

var E2R = 22

var drawEnemy = function($,i) {


    $.x += $.vx;
    $.vz -= .2 // Gravity accelerates down
    $.z+= $.vz;
    $ts($);

    if ($.sx+E2R+10 >= PSX && $.sx < PSX+P2R+10 && $.sy+E2R >= PSY-15 && $.sy < PSY+P2R+10) {
        if (t - lastTimeHadCoin > 180) // 3 seconds
            coinSoundIndex=0;
        //coins.splice(i,1);
        //i--;
        coinsSounds[coinSoundIndex++].play();
        coinSoundIndex = coinSoundIndex % coinsSounds.length;
        lastTimeHadCoin = t;
        initPlayer()
        return;
    }

    var floor = findFloor($.x, $.y, $.z+E2R); // inline?
    if (floor != $.floor) {
        // made it to edge - turn back
        $.x -= $.vx;
        $.vx *= -1;
    }
    else {
        if ($.z <= floor.z) {// bounce
            $.z =floor.z;
            $.vz = 2;
        }
    }

//    var wall = collide($.x+P2R4, $.y, $.z+P2R4, PR, VX>0 ? CollisionLeftFace: CollisionRightFace ); // collide left and right
//    if (wall) {
//        PX-= VX;
//        bounceWall.play();
//        if (PZ-floor.z > 10) {
//            // collide while in jump - hardly bouncing back to make it easier to jump onto platforms
//            VX= -VX*.2;
//        }
//        else {
//            // collide on ground - bounce back
//            VX= -VX*.8;
//        }
//    }

//    if (abs(VX) < 0.05) VX = 0;


    drawBall($.floor, $.vx<0, $.x, $.y, $.z, E2R , enemyColor, "◕` ᐟ◕ ノ", "⁔", -8,9)
}

