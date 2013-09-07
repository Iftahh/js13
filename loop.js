BgC.fillStyle="#222"
BgC.fillRect(0,0,width,height)


fcurCameraX = CameraX = (Player.sx - width *.5);
fcurCameraY = CameraY = (Player.sy - height *.8);

//initBackgroundDraw();


//texturecube(50, 500, 80, 120, 100, stones[0],stones[1],stones[2]);
//C.restore()

C=FdC
t = 0;
                              // CameraXY  defines where the camera should move to

// hack - because playerY doesn't change we can get the behind and front part pre-loop
// TODO: use cached background buffer for these

var rightPlayerEdge = 0

function tick() {
    t++;

    fcurCameraX = fcurCameraX*.9 + CameraX*.1;
    OffsetX = round(fcurCameraX);
    fcurCameraY = fcurCameraY*.9 + CameraY*.1;
    OffsetY = round(fcurCameraY);

    //drawBackground();  // TODO: inline

    trns(1,0,0,1,0,0);
    C.clearRect(OffsetX, OffsetY, width, height);



    rightPlayerEdge = Player.sx+P2R

    playerUpdate()

    each(sprites, function($,i) {
        // TODO: check clip
        if ($.update) $.update($)
        // behind player - draw before player
        if ($.preDraw($,true)) {
            $.draw($)
        }
    })
    C.globalAlpha = 1

    playerDraw();
    //each(enemies, drawEnemy)


    each(sprites, function($,i) {
        // not behind player - draw after player
        // TODO: check clip
        if ($.preDraw($, false)) {
            $.draw($)
        }
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
