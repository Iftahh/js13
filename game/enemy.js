


var addEnemy = function(x,y) {
    var $ = {
        x:x+E2R4, y:IPY+E2R4,z:y+E2R4,
        h: E2R,
        vx: -1,
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

    var wall = collide($.x, $.y, $.z, ER, $.vx>0 ? CollisionLeftFace: CollisionRightFace ); // collide left and right
    if (wall) {
        $.x-= $.vx;
        $.vx *= -1;
    }

//    if (abs(VX) < 0.05) VX = 0;


    var floor = findFloor($.x, $.y, $.z, ER); // inline?
    if (floor != $.floor) {
        // made it to edge - turn back
        $.x -= $.vx;
        $.vx *= -1;
    }
    else {
        $.floorZ = floor.z + E2R4;
        if ($.z <= $.floorZ) {// bounce
            $.z = $.floorZ;
            $.vz = 2;
        }
    }
    toScreenSpace($);
    $.sx -= E2R4;
    $.sy -= E2R4/2;

    if ($.sx+ $.sw >= Player.sx && $.sx < Player.sx+Player.sw && $.sy+ $.sh >= Player.sy
        && $.sy < Player.sy+Player.sh) {
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

}

var drawEnemy = function($) {


    drawBall($)
}

