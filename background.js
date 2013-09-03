
    cachedParams= {
        leftX: Infinity,
        topY: Infinity
    }
    buffers= [{
        cacheContext: null,
        cachedImage: null
    }, {
        cacheContext: null,
        cachedImage: null
    }]

    drawingBuffer= 0
    bufferWidth= null
    bufferHeight= null


    buffer_extra = 1.6;  // TODO: inline later ?
    padding = (buffer_extra - 1) / 2;

    qcw = padding * width;   // padding of current client width - quarter client width
    qch = padding * height;

    initBackgroundDraw = function() {  // TODO: inline  // if the width/height of the screen changes - call this function again
        console.log("Creating cache")
        bufferWidth = width * buffer_extra;
        bufferHeight = height * buffer_extra;
        var bw = Math.round(bufferWidth);
        var bh = Math.round(bufferHeight);

        var buff = buffers[0];
        var fu =  function(context,img) {buff.cachedImage =img; buff.cacheContext=context;}
        r2c(bw,bh, fu);
        buff = buffers[1];
        r2c(bw,bh,fu);
    }

    _drawBackground = function(ctx, left, top, width, height) {  // TODO: change to use global for ctx and not param?
        if (height ==0 || width == 0) return;
        var oldC = C;
        C = ctx;
        C.save();
        C.beginPath();
        C.rect(screenOffsetX,screenOffsetY, width,height);
        C.fill();
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
    drawBackground = function() {
        screenOffsetX = 0;
        screenOffsetY = 0;

        // optimization for higher FPS - cache into larger-than-screen buffer and use it whenever possible

//        BgC.fillRect(0,0, width, height);
//        OffsetX = leftX; OffsetY = topY;
//        _drawBackground(BgC, width, height);
//        OffsetX=oox;OffsetY=ooy;
//        return;

        var drawn = buffers[drawingBuffer];

        var dx = curCameraX - cachedParams.leftX;
        var dy = curCameraY - cachedParams.topY;
        var adx = abs(dx);
        var ady = abs(dy);
        if (adx > qcw || ady > qch) {

            // draw into cache

            var cctx = drawn.cacheContext;

            if (cachedParams.leftX != Infinity) {
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

                // console.log("reuse drawing at "+x+", "+y+ "   sxy="+sx+","+sy+ " wh:"+reuseWidth+","+reuseHeight);
                var backBuffer = buffers[1-drawingBuffer];
                var cctx2 = backBuffer.cacheContext;

//                cctx2.setTransform(1,0,0,1,0,0);
                cctx2.drawImage(drawn.cachedImage,sx,sy, reuseWidth, reuseHeight,
                    x, y, reuseWidth, reuseHeight);


                var top  = curCameraY-qch;
                var left = curCameraX;//bufferWidth;
                if (dy < 0) {
                    // draw horizontal strip at top of buffer
                    console.log("horiz strip at "+left+", "+top+ "   w,h="+bufferWidth+","+ady+ " (top of buffer)");
                    _drawBackground(cctx2, left, top, bufferWidth, ady);
                    // the vertical strip should DY down
                    screenOffsetY = ady;
                    top += ady;
                }
                else {
                    console.log("horiz strip at "+left+", "+(top+bufferHeight-ady)+ "   w,h="+bufferWidth+","+ady + " (bottom of buffer)");
                    // draw horizontal strip at bottom of buffer
                    screenOffsetY = bufferHeight-ady;
                    _drawBackground(cctx2, left, top+bufferHeight-ady, bufferWidth, ady);
                    screenOffsetY = 0;
                    // the vertical strip should start at top - no need for modifying top or translating context
                }

                if (dx < 0) {
                    left -= qcw;
                    console.log("vert strip at "+left+", "+top+ "   w,h="+adx+","+(bufferHeight-ady) + " (left of buffer)");
                    // draw vertical strip on the left of buffer
                    _drawBackground(cctx2, left, top, adx, bufferHeight-ady);
                }
                else {
                    left -= adx;
                    console.log("vert strip at "+left+", "+top+ "   w,h="+adx+","+(bufferHeight-ady) + " (right of buffer)");
                    // draw vertical strip on the right of buffer
                    screenOffsetX = bufferWidth-adx;
                    _drawBackground(cctx2, left, top, adx, bufferHeight-ady);
                }


                drawingBuffer = 1-drawingBuffer;
                drawn = buffers[drawingBuffer];
            }
            else {
                var top  = curCameraY-qch;// - bufferHeight/2;
                var left = curCameraX-qcw;// - bufferWidth /2;
                console.log("Drawing for the first time at "+left+", "+top+",  buffer: "+bufferWidth+","+bufferHeight);

                //cctx.setTransform(1,0,0,1,0,0); // TODO: remove
                //cctx.fillRect(0,0, bufferWidth, bufferHeight);
                _drawBackground(cctx, left, top, bufferWidth, bufferHeight);
            }

//            var tmp = drawn;
//            drawn = toDraw;
//            toDraw = tmp;
//            cachedParams = renderParams;
            cachedParams.leftX = curCameraX;
            cachedParams.topY = curCameraY;
        }
        // draw from cache

        var x = curCameraX - cachedParams.leftX + qcw;
        var y = curCameraY - cachedParams.topY + qch;

//        console.log("Showing cache at "+x+","+y)
        BgC.drawImage(drawn.cachedImage, x,y, width, height, 0, 0, width, height);

        OffsetX=curCameraX;OffsetY=curCameraY;
    }

