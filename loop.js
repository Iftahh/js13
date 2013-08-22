
t = 0;
function tick() {
    t++;
    C.save()
    C.fillStyle = "#CDF";
    trns(1,0,0,1,0,0);
    C.fillRect(0,0,width,height);

    drawSprites() // TODO: inline

    //texturecube(50, 500, 80, 120, 100, stones[0],stones[1],stones[2]);
    C.restore()

    coins.init(); // TODO: inline
    for (i in coins.d) {
        coins.draw(coins.d[i])
    }
    C.restore()

//    trns(hsc, hsk,vsk,vsc,X,Y)
//    C.drawImage(dirt2, 0,0, W,H);



    var x=40;
    for (i=0; i<faces.length; i++) {
        var s=faces[i];
        var l= s.length;
        trns(1,0,0,1, x,50+l);
        C.beginPath();
        C.fillStyle = grd;
        C.arc(0, 0, 20+l, 0, TPI);
        C.fill();
        C.fillStyle = "#222"
        C.fillText(faces[i],-5-l*2,-4+l)
        C.stroke()
        x+= 40+l*6;
    }
    trns(1,0,0,1,0,0);


   // rq(tick)
}
rq(tick);
