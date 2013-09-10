
var baseSound = [0,,0.14,0.445,0.4616,0.6,,,,,,0.587,0.5406,,,,,,1,,,,,0.45]

var coinsSounds = []
range(5, function(i) { coinsSounds.push(jsfxr(cloneUpdateArray(baseSound, {5: .6+i *.05})))})
range(4, function(i) { coinsSounds.push(jsfxr(cloneUpdateArray(baseSound, {5: .8-i *.05})))})


var coinSoundIndex=0;


var lastTimeHadCoin =0;

var coinsToRemove = [];

var coinPad = 4;
var updateCoin = function($) {
    if ($.sx >= Player.sx-coinPad && $.sx < Player.sx+P2R+coinPad && $.sy >= Player.sy-coinPad && $.sy < Player.sy+P2R+coinPad) {
        if (totalTime - lastTimeHadCoin > 3000) // 3 sec
            coinSoundIndex=0;

        coinsSounds[coinSoundIndex++].play();
        coinSoundIndex = coinSoundIndex % coinsSounds.length;
        lastTimeHadCoin = totalTime;
        coinsToRemove.push($.id)
    }
}

var drawCoin = function($) {
    var s = (totalTime+ $.t) % coinsImages.length;
    C.drawImage(coinsImages[s], $.sx-COINS_IMG_SIZE/2, $.sy-COINS_IMG_SIZE/2);
}

var removePickedCoins = function() {
    each(coinsToRemove, function(id) {
        for (var j=0;j<sprites.length; j++) {
            if (sprites[j].id == id){
                sprites.splice(j,1);
                break;
            }
        }
    })

    coinsToRemove = [];
}

var COINS_IMG_SIZE = 80;
// generate coin textures:

var coinsImages = [];
range(128, function(i){
    var scale = abs(Math.sin(TPI*i/128))
    if (scale> 0.1) {
        coinsImages.push(r2c(COINS_IMG_SIZE,COINS_IMG_SIZE, function(c) {
            c.strokeStyle = "#aa6"
            c.shadowBlur=30;
            c.lineWidth=2;
            c.shadowColor="#ff2"

            c.beginPath();
            c.setTransform(scale,0,0,1,COINS_IMG_SIZE/2,COINS_IMG_SIZE/2);
            c.fillStyle = "#fe4"
            c.arc(0, 0, 10, 0, TPI);
            c.fill(); // TODO: can save space by binding to global function:  F= function() {C.fill();}
            c.fillStyle = "#aa6"
            if (i>63)
                c.fillText("1",-3,3.5)
            else
                c.fillText("♛",-5,3.5)
            c.stroke();
        }))
    }

})




var addCoin = function(x,y) {
    var coin = {
        x:x, z:y, y:IPY,
        h:10, w:10, d:0,
        sh: 10, sw:10,
        t:irnd(0,100),
        update: updateCoin,
        draw: drawCoin,
        isCoin:true
    }
    toScreenSpace(coin)
    addSprite(coin)
}

