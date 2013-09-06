var RS = [] // rotation scale
for (i=0; i<128; i++) { // skipping 0 and
    s = abs(Math.sin(TPI*i/128))
    if (s> 0.1)
        RS.push(s)
}

var baseSound = [0,,0.14,0.445,0.4616,0.6,,,,,,0.587,0.5406,,,,,,1,,,,,0.45]

coinsSounds = [
    jsfxr(baseSound),
    jsfxr(cloneUpdateArray(baseSound, {5: .65})),
    jsfxr(cloneUpdateArray(baseSound, {5: .7})),
    jsfxr(cloneUpdateArray(baseSound, {5: .75}))
]

var initCoins = function() {  // TODO: inline
    C.save()
    C.strokeStyle = "#aa6"
    C.shadowBlur=30;
    C.lineWidth=2;
    C.shadowColor="#ff2"
    C.shadowOffsetX=0
    C.shadowOffsetY=0
}

var coinSoundIndex=0;

var lastTimeHadCoin =0;
var drawCoin = function() {
    C.beginPath();
    if ($.x >= PSX-10 && $.x < PSX+P2R+10 && $.y >= PSY-10 && $.y < PSY+P2R+10) {
        if (t - lastTimeHadCoin > 180) // 3 seconds
            coinSoundIndex=0;
        coins.splice(i,1);
        i--;
        coinsSounds[coinSoundIndex++].play();
        coinSoundIndex = coinSoundIndex % coinsSounds.length;
        lastTimeHadCoin = t;
        return;
    }
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
}
//   , initShadows: function() {
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
//}


var coins = []; // data

var addCoin = function(x,y) {
    X=x;Z=y;ts();
    coins.push({x:SX, y:SY, t:irnd(0,100)})
}

