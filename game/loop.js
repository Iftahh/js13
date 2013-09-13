


//initBackgroundDraw();

var resetJoystick=function() {
    joystick = {
        x: width *.15,
        y: height *.8,
        move: null,
        button: null
    }
}
resetJoystick();

loadLevel(test_lvl);


window.onresize = function() {
    var parent = canvases[0].parentElement;
    var _w = width, _h = height;
    width = min(960, parent.offsetWidth);
    height = min(760, parent.offsetHeight);
    //var offsetY = (parent.offsetTop+(parent.offsetHeight - height)/2)+"px"
    var offsetX = (parent.offsetLeft+(parent.offsetWidth - width)/2)+"px"
    each(canvases, function($) {
        $.style.top = 0;//offsetY;
        $.style.left = offsetX;
        if (_w != width || _h != height) {
            $.width = width;
            $.height = height;
        }
    })
    BgC.fillStyle=BgCStyle
    BgC.fillRect(0,0,width,height)
    if (_w != width || _h != height) {
        each(sprites, function($){
            if ($.toScreenSpace) {
                $.toScreenSpace($)
            }
            else
                toScreenSpace($)
        })
        resetJoystick();
    }
}
onresize()

if(navigator.userAgent.match(/Android/i)){
    window.scrollTo(0,1);
    BgC.fillStyle=BgCStyle
    BgC.fillRect(0,0,width,height)
}

fcurCameraX = CameraX = (Player.sx - width *.5);
fcurCameraY = CameraY = (Player.sy - height *.8);




//texturecube(50, 500, 80, 120, 100, stones[0],stones[1],stones[2]);
//C.restore()

C=FdC
var startTime = null;

var totalTime, fTotalTime;
                              // CameraXY  defines where the camera should move to

// hack - because playerY doesn't change we can get the behind and front part pre-loop
// TODO: use cached background buffer for these

var spritesIn = []

function tick(ts) {
    if (startTime == null) {
        startTime = ts;
        fTotalTime = ts;
    }
    totalTime = ((fTotalTime-startTime)/16) | 0;

    var dt = min(3, (ts - fTotalTime) /16); // time passed in units of 16ms - to easily scale the movements I made for constant 16ms intervals
                                            // do not allow more than 3 units to pass (even if FPS is super low) - it messes up the movements
    fTotalTime = ts;

    fcurCameraX = fcurCameraX*.9 + CameraX*.1;
    OffsetX = round(fcurCameraX);
    fcurCameraY = fcurCameraY*.9 + CameraY*.1;
    OffsetY = round(fcurCameraY);

    //drawBackground();  // TODO: inline

    trns(1,0,0,1,0,0);
    C.clearRect(OffsetX, OffsetY, width, height);

    //playerUpdate()
    var spritesNear = spritesInWindow(sprites, OffsetX-width/2, OffsetY-height/2, width*2,height*2);

    Player.update(Player, dt)

    each(spritesNear, function($) {
        // TODO: check clip
        if ($.update)
            $.update($,dt)
    });

    spritesIn = spritesInWindow(spritesNear, OffsetX, OffsetY, width, height);
//    if (DEBUG && spritesIn.length > MAX_SPRITES_IN_CACHE) {  - this isn't useful now that coins are sprites too - they don't take space in cache
//        log("too many sprites in screen to fit in cache")
//    }

    var spritesBehindPlayer = [];
    var spritesAfterPlayer = [];
    each(spritesIn, function($) {
        if (behindPlayer($)) {
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
        setAlpha($)
        $.draw($)
    })
    _setAlpha(1)


    removePickedCoins();


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
