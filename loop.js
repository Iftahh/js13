C=BgC

initBackgroundDraw();

getClose = function(a,b) {
    return Math.round(abs(a-b) <= 1 ? b :  a *.9+b *.1)
}

//texturecube(50, 500, 80, 120, 100, stones[0],stones[1],stones[2]);
C.restore()

C=FdC
t = 0;
var oldCameraX = oldCameraY = 0;
var fcurCameraX = fcurCameraY = 0 //  fcur-camera defines what is being viewed
var curCameraX = curCameraY = 0;  // cur-Camera is the integer round of fcur - needed in order to avoid fuzzy drawimage for background
                              // CameraXY  defines where the camera should move to

function tick() {
    t++;

    if (CameraX != oldCameraX || CameraY != oldCameraY) {
        if (abs(curCameraX-CameraX) <= 1) {
            curCameraX = Math.round(CameraX);
            oldCameraX = CameraX; // stop animating background
        }
        else {
            fcurCameraX = fcurCameraX*.9 + CameraX*.1;
            curCameraX = round(fcurCameraX);
        }
        if (abs(curCameraY-CameraY) <= 1) {
            curCameraY = Math.round(CameraY);
            oldCameraY = CameraY; // stop animating background
        }
        else {
            fcurCameraY = fcurCameraY*.9 + CameraY*.1;
            curCameraY = round(fcurCameraY);
        }

        drawBackground();  // TODO: inline
    }

    trns(1,0,0,1,0,0);
    C.clearRect(curCameraX, curCameraY, width, height);

    initCoins(); // TODO: inline
    each(coins, function(){
        drawCoin()
    })
    C.restore()

//    trns(hsc, hsk,vsk,vsc,X,Y)
//    C.drawImage(dirt2, 0,0, W,H);



//    var x=40;
//    for (i=0; i<faces.length; i++) {
//        var s=faces[i];
//        var l= s.length;
//        trns(1,0,0,1, x,50+l);
//        C.beginPath();
//        C.fillStyle = grd;
//        C.arc(0, 0, 20+l, 0, TPI);
//        C.fill();
//        C.fillStyle = "#222"
//        C.fillText(faces[i],-5-l*2,-4+l)
//        C.stroke()
//        x+= 40+l*6;
//    }
//    trns(1,0,0,1,0,0);

    player();

    //drawBackSprites();

    drawFrontSprites();
    rq(tick)
}
rq(tick);
