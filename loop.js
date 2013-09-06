BgC.fillStyle="#222"
BgC.fillRect(0,0,width,height)


fcurCameraX = CameraX = (PSX - width *.5);
fcurCameraY = CameraY = (PSY - height *.8);

//initBackgroundDraw();


//texturecube(50, 500, 80, 120, 100, stones[0],stones[1],stones[2]);
//C.restore()

C=FdC
t = 0;
                              // CameraXY  defines where the camera should move to

// hack - because playerY doesn't change we can get the behind and front part pre-loop
// TODO: use cached background buffer for these

var leftPlayerEdge = PSX-2

function tick() {
    t++;

    fcurCameraX = fcurCameraX*.9 + CameraX*.1;
    OffsetX = round(fcurCameraX);
    fcurCameraY = fcurCameraY*.9 + CameraY*.1;
    OffsetY = round(fcurCameraY);

    //drawBackground();  // TODO: inline

    trns(1,0,0,1,0,0);
    C.clearRect(OffsetX, OffsetY, width, height);



    leftPlayerEdge = PSX-2

    each(sprites, function() {
        // behind player - draw before player
        // TODO: check clip
        if ($.preDraw(true)) {
            $.draw()
        }
    })

    player();

    each(sprites, function() {
        // not behind player - draw after player
        // TODO: check clip
        if ($.preDraw(false)) {
            $.draw()
        }
    })
    C.globalAlpha = 1

    // TODO: coins are just front facing sprites
    initCoins(); // TODO: inline
    each(coins, function(){
        drawCoin()
    })
    C.restore()

    //drawBackSprites();

//    C.save()
//    drawFrontSprites();
//    C.restore()
    rq(tick)
}
rq(tick);
