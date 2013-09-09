// load level from SVG

function load_from_svg(svg) {
    var alerted = false;
    var safeAlert = function(t) {
        if (alerted) {
            console.log(t);
        }
        else {
            alerted = true;
            alert(t);
        }
    }
    var ellipse_re = /<ellipse( [^>]+)>/
    var id_re = / id="([^"]+)"/
    var cy_re = / cy="([^"]+)"/
    var cx_re = / cx="([^"]+)"/
    var fill_re = / fill="#([0-9a-f]+)"/

    var rect_re = /<rect( [^>]+)>/
    var height_re = / height="([^"]+)"/
    var width_re = / width="([^"]+)"/
    var y_re = / y="([^"]+)"/
    var x_re = / x="([^"]+)"/

    sprites = []
    coins = []
    CollisionLeftFace = []  // collision when moving left (X--)
    CollisionRightFace = []  // collision when moving right (X++)
    CollisionTopFace = []  // collision when moving down (Z--)
    CollisionBottomFace = []
    OffsetX=OffsetY=0

    var int=function(n) {
        return Math.round(parseFloat(n))
    }
    var flipY=function(y) {
        return height-int(y) //-1*int(y)
    }
    var fixY=function(y,h) {
        return flipY(y)-int(h)
    }

    IPX = 0
    IPY = 50
    IPZ= 0

    var to_player=function($) {
        console.log("Player   ID: "+ $.id)
        IPX = int($.x)
        IPZ = flipY($.y)
        initPlayer()
    }

    var to_platform=function($) {
        var id= $.id,color= $.color,w= $.w,h= $.h,x= $.x,y= $.y
        console.log("Platform ID: "+id)
        if (id == "svg_37") {
            debugger
        }
        if (color == '7fff00') {
            DR=textureDraw
        }
        else if (color == '7f3f00'){
            DR=brickDraw;
        }
        else {
            safeAlert(">>>>  Unknown rect: color:"+color );
            return
        }

        B = 0xfff;
        Y=_y;
        addCube(int(x), fixY(y,h), int(w), int(h));
    }

    var to_coins=function($) {
        console.log("Coin ID: "+ $.id)
        addCoin(int($.x),flipY($.y))
    }

    var to_enemy=function($) {
        console.log("Enemy ID: "+ $.id)
        addEnemy(int($.x),flipY($.y))
    }

    var process_ellipse=function(arc) {
        var color = arc['color']
        delete arc['color']
        if (color== '0000ff')
            to_player(arc)
        else if (color == 'ff7f00')
            to_enemy(arc)
        else if (color  == 'ffff00')
            to_coins(arc)
        else
            safeAlert(">>>>>>>>>>>  unknown ellipse: color="+color);
    }


    var _y = 0

    PY=IPY=50;
    Y=0; BW=27;BC=BBC;
    DR=brickDraw;D=100;

    svg = svg.split('\n')
    for (var i=0; i<svg.length; i++) {
        var line =svg[i];
        //print line
        if (line.indexOf("<title>Back</title>") > -1) {
            console.log("****  Back ****")
            _y = 90
            Y=90;
            D=10;
        }
        if (line.indexOf( "<title>Main</title>") > -1) {
            console.log("***** Main ****")
            _y=0
            Y=0;
            D=100;
        }
        if (line.indexOf( "<title>Front (hiding)</title>") > -1) {
            _y=0
            console.log("***** FRONT *****")
            Y=0;
            D=10;
        }

        var attributes = rect_re.exec(line)
        if (attributes) {
            attributes= attributes[1]
            var rect = {
                "id": id_re.exec(attributes)[1],
                "y": y_re.exec(attributes)[1],
                "x": x_re.exec(attributes)[1],
                "color": fill_re.exec(attributes)[1],
                "w": width_re.exec(attributes)[1],
                "h": height_re.exec(attributes)[1]
            }

            to_platform(rect)
        }


        attributes = ellipse_re.exec(line)
        if (attributes) {
            attributes = attributes[1];
            var ellipse = {
                "id": id_re.exec(attributes)[1],
                "y": cy_re.exec(attributes)[1],
                "x": cx_re.exec(attributes)[1],
                "color": fill_re.exec(attributes)[1]
            }

            process_ellipse(ellipse)
        }
    }
}
