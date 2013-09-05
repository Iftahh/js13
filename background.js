
var cachedLeftX= 0;
var cachedTopY= 0;
var buffers= [0,0]

var drawingBuffer= 0;
var bufferWidth= null;
var bufferHeight= null;
var screenOffsetX=screenOffsetY=0;

var BgColor = "#022"

var buffer_extra = 1.6;  // TODO: inline later ?
var padding = (buffer_extra - 1) / 2;

var qcw = padding * width;   // padding of current client width - quarter client width
var qch = padding * height;

var oldCameraX, oldCameraY,
    fcurCameraX, fcurCameraY,  //  fcur-camera defines what is being viewed
    curCameraX, curCameraY = 0;  // cur-Camera is the integer round of fcur - needed in order to avoid fuzzy drawimage for background

var drawn = 0;

var initBackgroundDraw = function() {  // TODO: inline  // if the width/height of the screen changes - call this function again
    log("Creating cache")
    bufferWidth = width * buffer_extra;
    bufferHeight = height * buffer_extra;
    var bw = round(bufferWidth);
    var bh = round(bufferHeight);


    buffers[0] = drawn = {};
    var fu =  function(context,img) {drawn.cachedImage =img; drawn.cacheContext=context;}
    r2c(bw,bh, fu);
    buffers[1] = drawn = {};
    r2c(bw,bh,fu);

    oldCameraX = fcurCameraX = CameraX = (PSX - width *.5);
    oldCameraY = fcurCameraY = CameraY = (PSY - height *.8);
    curCameraX = round(CameraX);
    curCameraY = round(CameraY);


    var top  = curCameraY-qch;// - bufferHeight/2;
    var left = curCameraX-qcw;// - bufferWidth /2;
    log("Drawing for the first time at "+left+", "+top+",  buffer: "+bufferWidth+","+bufferHeight);

    //cctx.setTransform(1,0,0,1,0,0); // TODO: remove
    //cctx.fillRect(0,0, bufferWidth, bufferHeight);
    _drawBackground(drawn.cacheContext, left, top, bufferWidth, bufferHeight);
    drawingBuffer = 1;
    cachedLeftX = curCameraX;
    cachedTopY = curCameraY;
    drawFromCache();

}

var drawFromCache=function() {

    // draw from cache

    var x = curCameraX - cachedLeftX + qcw;
    var y = curCameraY - cachedTopY + qch;

//        log("Showing cache at "+x+","+y)
    BgC.drawImage(drawn.cachedImage, x,y, width, height, 0, 0, width, height);

    OffsetX=curCameraX;
    OffsetY=curCameraY
}

var _drawBackground = function(ctx, left, top, width, height) {  // TODO: change to use global for ctx and not param?
    if (height ==0 || width == 0) return;
    var oldC = C;
    C = ctx;
    C.save();
    C.fillStyle=BgColor;//RGB(t%40, t%80, t% 255)//BgColor;
    C.fillRect(screenOffsetX,screenOffsetY, width,height);
    C.rect(screenOffsetX,screenOffsetY, width,height);
    C.clip();
    // TODO: need to add screenoffset to camera?
    OffsetX = left; OffsetY = top;
    each(backSprites, function() {
        x= $.sx, y= $.sy,w= $.w,h= $.h;
//            if (x+OffsetX+w > screenOffsetX && x+OffsetX < screenOffsetX+width
//                && y+OffsetY+h > screenOffsetY && y+OffsetY < screenOffsetY+height) {
            d= $.d, b= $.br;
            $.draw();
//            }
    })
    C.restore();
    C = oldC;
}



    // draw at curCamera - inside backbuffer
var drawBackground = function() {


    if (CameraX == oldCameraX && CameraY == oldCameraY) {
        return; // already drawn
    }
    if (abs(curCameraX-CameraX) <= 1) {
        curCameraX = round(CameraX);
        oldCameraX = CameraX; // stop animating background
    }
    else {
        fcurCameraX = fcurCameraX*.9 + CameraX*.1;
        curCameraX = round(fcurCameraX);
    }
    if (abs(curCameraY-CameraY) <= 1) {
        curCameraY = round(CameraY);
        oldCameraY = CameraY; // stop animating background
    }
    else {
        fcurCameraY = fcurCameraY*.9 + CameraY*.1;
        curCameraY = round(fcurCameraY);
    }

    screenOffsetX = 0;
    screenOffsetY = 0;

    // optimization for higher FPS - cache into larger-than-screen buffer and use it whenever possible

//        BgC.fillRect(0,0, width, height);
//        OffsetX = leftX; OffsetY = topY;
//        _drawBackground(BgC, width, height);
//        OffsetX=oox;OffsetY=ooy;
//        return;

    drawn = buffers[drawingBuffer];

    var dx = curCameraX - cachedLeftX;
    var dy = curCameraY - cachedTopY;
    var adx = abs(dx);
    var ady = abs(dy);
    if (adx > qcw || ady > qch) {

        // draw into cache

        // already has image in cache
        var x,sx, y,sy;
        if (dx < 0) {
            // moved to left - set screen x to dx and source-x to 0
            x = adx;
            sx = 0;
        }
        else {
            // moved to right
            x = 0;
            sx = adx;
        }
        if (dy < 0) {
            // moved to top
            y = ady;
            sy = 0;
        }
        else {
            // moved to bottom
            sy = ady;
            y = 0;
        }

        var reuseWidth = bufferWidth - adx;
        var reuseHeight = bufferHeight - ady;

        // log("reuse drawing at "+x+", "+y+ "   sxy="+sx+","+sy+ " wh:"+reuseWidth+","+reuseHeight);
        var backBuffer = buffers[1-drawingBuffer];
        var cctx2 = backBuffer.cacheContext;

//                cctx2.setTransform(1,0,0,1,0,0);
        cctx2.drawImage(drawn.cachedImage,sx,sy, reuseWidth, reuseHeight,
            x, y, reuseWidth, reuseHeight);


        var top  = curCameraY -qch;
        var left = curCameraX;//bufferWidth;
        if (dy < 0) {
            // draw horizontal strip at top of buffer
            log("1 horiz strip at "+left+", "+top+ "   w,h="+bufferWidth+","+ady+ " (top of buffer)");
            _drawBackground(cctx2, left, top, bufferWidth, ady);
            // the vertical strip should DY down
            screenOffsetY = ady;
            top += ady;
        }
        else {
            log("2 horiz strip at "+left+", "+(top+bufferHeight-ady)+ "   w,h="+bufferWidth+","+ady + " (bottom of buffer)");
            // draw horizontal strip at bottom of buffer
            screenOffsetY = bufferHeight-ady;
            _drawBackground(cctx2, left, top+bufferHeight-ady, bufferWidth, ady);
            screenOffsetY = 0;
            // the vertical strip should start at top - no need for modifying top or translating context
        }

        if (dx < 0) {
            left -= qcw;
            log("vert strip at "+left+", "+top+ "   w,h="+adx+","+(bufferHeight-ady) + " (left of buffer)");
            // draw vertical strip on the left of buffer
            _drawBackground(cctx2, left, top, adx, bufferHeight-ady);
        }
        else {
            left -= adx;
            log("vert strip at "+left+", "+top+ "   w,h="+adx+","+(bufferHeight-ady) + " (right of buffer)");
            // draw vertical strip on the right of buffer
            screenOffsetX = bufferWidth-adx;
            _drawBackground(cctx2, left, top, adx, bufferHeight-ady);
        }

        cachedLeftX = curCameraX;
        cachedTopY = curCameraY;

        drawingBuffer = 1-drawingBuffer;
        drawn = buffers[drawingBuffer];
    }


//            var tmp = drawn;
//            drawn = toDraw;
//            toDraw = tmp;
//            cachedParams = renderParams;
    drawFromCache();

}

