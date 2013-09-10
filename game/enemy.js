


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

var updateEnemy = function($,dt) {
    $.x += $.vx*dt;
    $.vz -= .2*dt // Gravity accelerates down
    $.z+= $.vz*dt;

    var wall = collide($.x, $.y, $.z, ER, $.vx>0 ? CollisionLeftFace: CollisionRightFace ); // collide left and right
    if (wall) {
        $.x = $.vx>0 ?  wall.x-ER : wall.x+wall.w+ER;      //$.x-= $.vx;
        $.vx *= -1;
    }

//    if (abs(VX) < 0.05) VX = 0;


    var floor = findFloor($.x, $.y, $.z, ER); // inline?
    if (floor != $.floor) {
        // made it to edge - turn back
        $.x = $.vx <0 ? $.floor.x-ER+2: $.floor.x+ $.floor.w-2; //$.x -= $.vx;
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

    var pad=10;
    if ($.sx+ $.sw-pad >= Player.sx && $.sx+pad < Player.sx+Player.sw && $.sy+ $.sh-pad >= Player.sy
        && $.sy+pad < Player.sy+Player.sh) {
        if (totalTime - lastTimeHadCoin > 180) // 3 seconds
            coinSoundIndex=0;
        //coins.splice(i,1);
        //i--;
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

