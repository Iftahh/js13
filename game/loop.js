


//initBackgroundDraw();

var resetJoystick=function() {
    joystick = {
        x: width/8,
        y: height *.85,
        move: null,
        button: null
    }
}
resetJoystick();

loadLevel(lvl);


onresize = function() {
    var parent = canvases[0].parentElement;
    var _w = width, _h = height;
    width = min(960, parent.offsetWidth);
    height = min(760, parent.offsetHeight);
    var offsetY = (parent.offsetTop+(parent.offsetHeight - height)/2)+"px"
    var offsetX = (parent.offsetLeft+(parent.offsetWidth - width)/2)+"px"
    each(canvases, function($) {
        $.style.top = offsetY;
        $.style.left = offsetX;
        if (_w != width || _h != height) {
            $.width = width;
            $.height = height;
        }
    })
    BgC.fillStyle="#222"
    BgC.fillRect(0,0,width,height)
    if (_w != width || _h != height) {
        each(coins, function($) {
            toScreenSpace($)
        })
        each(sprites, function($){
            toScreenSpace($)
        })
        resetJoystick();
    }
}
onresize()

fcurCameraX = CameraX = (Player.sx - width *.5);
fcurCameraY = CameraY = (Player.sy - height *.8);




//texturecube(50, 500, 80, 120, 100, stones[0],stones[1],stones[2]);
//C.restore()

C=FdC
t = 0;
                              // CameraXY  defines where the camera should move to

// hack - because playerY doesn't change we can get the behind and front part pre-loop
// TODO: use cached background buffer for these

var spritesIn = []

function tick() {
    t++;

    fcurCameraX = fcurCameraX*.9 + CameraX*.1;
    OffsetX = round(fcurCameraX);
    fcurCameraY = fcurCameraY*.9 + CameraY*.1;
    OffsetY = round(fcurCameraY);

    //drawBackground();  // TODO: inline

    trns(1,0,0,1,0,0);
    C.clearRect(OffsetX, OffsetY, width, height);



    //playerUpdate()
    var spritesNear = spritesInWindow(sprites, OffsetX-width/2, OffsetY-height/2, width*2,height*2);

    Player.update(Player)

    each(spritesNear, function($) {
        // TODO: check clip
        if ($.update)
            $.update($)
    });

    spritesIn = spritesInWindow(spritesNear, OffsetX, OffsetY, width, height);
    if (DEBUG && spritesIn.length > MAX_SPRITES_IN_CACHE) {
        log("too many sprites in screen to fit in cache")
    }

    var spritesBehindPlayer = [];
    var spritesAfterPlayer = [];
    each(spritesIn, function($) {
        if (behindCube($, Player)) {
            spritesBehindPlayer.push($)
        }
        else {
            spritesAfterPlayer.push($)
        }
    })


    each(spritesBehindPlayer, function($) {
        $.draw($)
    })
    Player.draw()

    each(spritesAfterPlayer, function($) {
        _setAlpha($)
        $.draw($)
    })
    C.globalAlpha = 1


    // TODO: coins are just front facing sprites

    drawCoins();


//    trns(1,0,0,1,0,0)
//    C.fillStyle = RGB(50,60,150,0.5);
//    C.fillRect(PSX,PSY, P2R,P2R);
//    C.fillStyle = RGB(150,160,250,0.9);
//    C.fillRect(PSX-1,PSY-1,3,3);
//    var $ = sprites[19];
//    C.fillRect($.sx+ $.w+ $.d/2+ -1, $.sy-1, 3,3)
//    C.fillStyle = RGB(150,60,50,0.5);
//    var $ = enemies[0]
//    C.fillRect($.sx, $.sy, E2R,E2R);

    rq(tick)
}
rq(tick);
