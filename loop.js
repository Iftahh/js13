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
var behindPlayer = []
each(frontFacingSprites, function() {
    if ($.y > PY) { // behind player - draw before player
        behindPlayer.push($)
    }
})
var infrontPlayer = []
each(frontFacingSprites, function() {
    if ($.y <= PY) { // behind player - draw before player
        infrontPlayer.push($)
    }
})


function tick() {
    t++;

    fcurCameraX = fcurCameraX*.9 + CameraX*.1;
    OffsetX = round(fcurCameraX);
    fcurCameraY = fcurCameraY*.9 + CameraY*.1;
    OffsetY = round(fcurCameraY);

    //drawBackground();  // TODO: inline

    trns(1,0,0,1,0,0);
    C.clearRect(OffsetX, OffsetY, width, height);




    each(behindPlayer, function() {
        // behind player - draw before player
        // TODO: check clip
        frontDraw()
        $.draw()
    })
    each(topFacingSprites, function() {
        if ($.z < PZ) { // below player - draw before player
            // TODO: check clip
            topDraw();
            $.draw()
        }
    })
    each(rightFacingSprites, function() {
        if ($.x+ $.w < PX) { // to the left of the player - draw before the player
            // TODO: check clip
            rightDraw();
            $.draw();
        }
    })



    player();

    each(topFacingSprites, function() {
        if ($.z >= PZ) { // above player - draw after player
            // TODO: check clip
            if ($.sx-10 < PSX && $.sx+10+ $.w+ $.d/2 > PSX  && $.y+ $.d < IPY) {
                C.globalAlpha = .3  // TODO: make alpha based on distance from player
            }
            else {
                C.globalAlpha = 1
            }
            topDraw();
            $.draw()
        }
    })
    each(infrontPlayer, function() {
        // TODO: check clip
        if ($.sx-10 < PSX && $.sx+10+ $.w+ $.d/2 > PSX  && $.y+ $.d < IPY) {
            C.globalAlpha = .3  // TODO: make alpha based on distance from player
        }
        else {
            C.globalAlpha = 1
        }
        frontDraw()
        $.draw()
    })
    each(rightFacingSprites, function() {
        if ($.x+$.w >= PX) { // to the right of the player - draw after the player
            // TODO: check clip
            if ($.sx < PSX && $.sx+40+ $.w+ $.d/2 > PSX  && $.y+ $.d < IPY) {
                C.globalAlpha = .3  // TODO: make alpha based on distance from player
            }
            else {
                C.globalAlpha = 1
            }
            rightDraw();
            $.draw();
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
