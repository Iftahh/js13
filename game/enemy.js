
var kingColor = C.createRadialGradient(15, -9, 3, 15, -9, 32);
// light red
kingColor.addColorStop(0, '#67B6FE');
// dark red
kingColor.addColorStop(1, '#535CB3');

var KR = 32
var K2R = 2*KR
var K2R4 = K2R/4

var kingLeftImg=0;
var addKing = function(x,y) {
    var $ = {
        x:x+K2R4, y:IPY+K2R4,z:y+K2R4,
        h: K2R,
        vx: 0,
        vz: 4,
        h:KR,
        w:KR,
        d:KR,
        sw:K2R,
        sh:K2R,
        radius:KR,
        draw: function($) {
            C.strokeStyle = "#221";
            C.fillRect(0,0,50,30);
            C.strokeRect(0,0,50,30);
            C.fillStyle = "#fe7"
            C.font="36px arial";
            C.fillText("♛",$.sx+15,$.sy+2)

            drawBall($);
        },
        update: function($, dt) {

            if (!$.floor) {
                $.floor = findFloor($.x+K2R4, $.y+K2R4, $.z+K2R4, KR);
                $.floorZ = $.floor.z + K2R4;
                if (DEBUG && $.floorZ < -10e6) {
                    alert("King must be above floor")
                }
            }

            speedUpdate($,dt)

            if ($.z <= $.floorZ) {// bounce
                $.z = $.floorZ;
                $.vz = abs($.vz);
            }

            toScreenSpace($);
            $.sx -= K2R4;
            $.sy -= K2R4/2;
        },
        color:kingColor,
        face: "ಠ ಎ ಠ",
        mouth: "⁔",
        mx:-8,
        my:9
    }
    toScreenSpace($);
    if (!kingLeftImg) {
        kingLeftImg = cacheBallImg(K2R, K2R, $, true);
    }
    $.leftImg = kingLeftImg;
    $.rightImg = kingLeftImg;

    sprites.push($)

}

var enemyRightImg, enemyLeftImg = false;

var addEnemy = function(x,y, speed) {
    var $ = {
        x:x+E2R4, y:IPY+E2R4,z:y+E2R4,
        h: E2R,
        vx: speed? speed/-10 :  -1,
        vz: 0,
        h:ER,
        w:ER,
        d:ER,
        sw:E2R,
        sh:E2R,
        radius:ER,
        draw: drawBall,
        update: updateEnemy,
        color:enemyColor,
        face: "◕` ᐟ◕ ノ",
        mouth: "⁔",
        mx:-8,
        my:9
    }
    toScreenSpace($);
    if (!enemyLeftImg) {
        enemyLeftImg = cacheBallImg(E2R, E2R, $, true);
        enemyRightImg =  cacheBallImg(E2R, E2R, $, false);
    }
    $.leftImg = enemyLeftImg;
    $.rightImg = enemyRightImg;

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

var updateEnemy = function($, dt) {

    if (!$.floor) {
        $.floor = findFloor($.x+E2R4, $.y+E2R4, $.z+E2R4, ER);
        $.floorZ = $.floor.z + E2R4;
        if (DEBUG && $.floorZ < -10e6) {
            alert("Enemy must be above floor")
        }
    }

    speedUpdate($,dt)

    var fell = 0;
    if ($.vx < 0 && $.x+ER <=  $.floor.x) {
        // fell of the left edge
        fell = 1;
    }
    else if ($.vx > 0 && $.x > $.floor.x+$.floor.w) {
        // fell of the right edge
        fell = 2;
    }

    if (fell != 0) {
        var floor = findFloor($.x, $.y, $.z, ER); // inline?
        if ($.floor != floor && abs(floor.z- $.floor.z ) < 10) {
            $.floor = floor;
            $.floorZ = $.floor.z + E2R4;
        }
        if (floor != $.floor) {
            // made it to edge - turn back
            $.x = fell==1 ? $.floor.x-ER+1: $.floor.x+ $.floor.w-1; //$.x -= $.vx;
            $.vx *= -1;
        }
    }
    if ($.z <= $.floorZ) {// bounce
        $.z = $.floorZ;
        $.vz = 2;
    }

    var wall = collide($.x, $.y, $.z, ER, $.vx>0 ? CollisionLeftFace: CollisionRightFace ); // collide left and right
    if (wall) {
        $.x = $.vx>0 ?  wall.x-ER : wall.x+wall.w+ER;      //$.x-= $.vx;
        $.vx *= -1;
    }


    toScreenSpace($);
    $.sx -= E2R4;
    $.sy -= E2R4/2;

    var pad=10;
    if ($.sx+ $.sw-pad >= Player.sx && $.sx+pad < Player.sx+Player.sw && $.sy+ $.sh-pad >= Player.sy
        && $.sy+pad < Player.sy+Player.sh) {
        if (totalTime - lastTimeHadCoin > 180) // 3 seconds
            coinSoundIndex=0;
        coinsSounds[coinSoundIndex++].play();
        coinSoundIndex = coinSoundIndex % coinsSounds.length;
        lastTimeHadCoin = totalTime;
        initPlayer()
        return;
    }

}


