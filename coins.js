var RS = [] // rotation scale
for (i=0; i<128; i++) { // skipping 0 and
    s = abs(Math.sin(TPI*i/128))
    if (s> 0.1)
        RS.push(s)
}

var baseSound = [0,,0.14,0.445,0.4616,0.6,,,,,,0.587,0.5406,,,,,,1,,,,,0.45]

var coinsSounds = []
range(5, function(i) { coinsSounds.push(jsfxr(cloneUpdateArray(baseSound, {5: .6+i *.05})))})
range(4, function(i) { coinsSounds.push(jsfxr(cloneUpdateArray(baseSound, {5: .8-i *.05})))})


var coinSoundIndex=0;

var lastTimeHadCoin =0;
var drawCoins = function($,i) {
    C.save()
    C.strokeStyle = "#aa6"
    C.shadowBlur=30;
    C.lineWidth=2;
    C.shadowColor="#ff2"
    C.shadowOffsetX=0
    C.shadowOffsetY=0

    for (var i=0; i<coins.length; i++) {
        var $=coins[i];

        if ($.x >= PSX-10 && $.x < PSX+P2R+10 && $.y >= PSY-15 && $.y < PSY+P2R+10) {
            if (t - lastTimeHadCoin > 180) // 3 seconds
                coinSoundIndex=0;
            coins.splice(i,1);
            i--;
            coinsSounds[coinSoundIndex++].play();
            coinSoundIndex = coinSoundIndex % coinsSounds.length;
            lastTimeHadCoin = t;
            continue;
        }
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
    }

    C.restore()
}


var coins = []; // data

var addCoin = function(x,y) {
    X=x;Z=y;
    Y=IPY;
    H=10;
    ts();
    coins.push({x:SX, y:SY, t:irnd(0,100)})
}

