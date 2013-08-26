RS = [] // rotation scale
for (i=0; i<128; i++) { // skipping 0 and
    s = abs(Math.sin(TPI*i/128))
    if (s> 0.1)
        RS.push(s)
}
coins = {
    init: function() {
        C.save()
        C.strokeStyle = "#aa6"
        C.shadowBlur=30;
        C.lineWidth=2;
        C.shadowColor="#ff2"
        C.shadowOffsetX=0
        C.shadowOffsetY=0
    },
    draw: function($) {
        C.beginPath();
        L = RS.length
        var d= ($.t+t)%L;
        trns(RS[d],0,0,1, $.x, $.y)
        C.fillStyle = "#fe4"
        C.arc(0, 0, 10, 0, TPI);
        C.fill(); // TODO: can save space by binding to global function:  F= function() {C.fill();}
        C.fillStyle = "#aa6"
        if (d>L/2)
            C.fillText("1",-3,3.5)
        else
            C.fillText("♛",-5,3.5)
        C.stroke();
    },
//    initShadows: function() {
//
//    }
//    drawShadows: function($) {
//        // shadow
//        var sx=SX,sy=SY;
//        Z=floor.z;ts();
//        C.save();
//        trns(1,0,0,.3, SX-4,SY+H/2+5);
//        C.arc(0, 0, 20, 0, TPI);
//        C.fillStyle = RGB(15,15,15,0.5);
//        C.shadowColor = RGB(15,15,15,0.5);
//        C.shadowBlur = 25;
//        C.fill();
//        C.restore()
//    }
}


coins.d = [] // data
for (i=0; i<10; i++) {
    coins.d.push({x:rnd()*700+50, y:rnd()*500+50, t:floor(rnd()*100)})
}
