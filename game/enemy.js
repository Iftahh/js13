


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
        draw: drawEnemy,
        update: updateEnemy,
        color:enemyColor,
        face: "◕` ᐟ◕ ノ",
        mouth: "⁔",
        mx:-8,
        my:9
    }
    toScreenSpace($)

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

var drawEnemy = function($) {


    drawBall($)
}

