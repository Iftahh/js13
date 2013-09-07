


var addEnemy = function(x,y) {
    var $ = {
        x:x, y:IPY,z:y,
        h: E2R,
        vx: -1,
        vz: 0,
        dim1: E2R,
        dim2: E2R,
        borders: 0,
        preDraw: frontDraw,
        draw: drawEnemy,
        update: updateEnemy
    }
    $ts($)

    $.floor = findFloor($.x+E2R4, $.y+E2R4, $.z+E2R4, ER);
    if (DEBUG && !$.floor) {
        alert("Enemy must be above floor")
    }

    sprites.push($)
}

var enemyColor = C.createRadialGradient(15, -9, 3, 15, -9, 32);
// light red
enemyColor.addColorStop(0, '#FFD6CE');
// dark red
enemyColor.addColorStop(1, '#B34C80');

var ER = 22
var E2R = 2*ER
var E2R4 = E2R/4

var updateEnemy = function($) {
    $.x += $.vx;
    $.vz -= .2 // Gravity accelerates down
    $.z+= $.vz;
    $ts($);

    if ($.sx+E2R >= Player.sx && $.sx < Player.sx+P2R && $.sy+E2R >= Player.sy && $.sy < Player.sy+P2R) {
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

    var wall = collide($.x+E2R4, $.y, $.z+E2R4, ER, $.vx>0 ? CollisionLeftFace: CollisionRightFace ); // collide left and right
    if (wall) {
        $.x-= $.vx;
        $.vx *= -1;
    }

//    if (abs(VX) < 0.05) VX = 0;


    var floor = findFloor($.x+E2R4, $.y+E2R4, $.z+E2R4, ER); // inline?
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
    $ts($);
}

var drawEnemy = function($) {


    H=E2R;
    drawBall($.floor, $.vx<0, $.x, $.y, $.z, ER , enemyColor, "◕` ᐟ◕ ノ", "⁔", -8,9)
}

