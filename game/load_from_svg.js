// load level from SVG

function load_from_svg(svg) {

    var ellipse_re = /<ellipse ([^>]+)>/
    var id_re = /\bid="([^"]+)"/
    var cy_re = /\bcy="([^"]+)"/
    var cx_re = /\bcx="(?P<x>[^"]+)"/
    var fill_re = /\bfill="#([0-9a-f]+)"/

    var rect_re = /<rect ([^>]+)>/
    var height_re = /\bheight="([^"]+)"/
    var width_re = /\bwidth="([^"]+)"/
    var y_re = /\by="([^"]+)"/
    var x_re = /\bx="([^"]+)"/

    sprites = []
    coins = []

    var float=function(n) {
        return Math.round(parseFloat(n))
    }
    var flipY=function(y) {
        return height-float(y) //-1*float(y)
    }
    var fixY=function(y,h) {
        return flipY(y)-float(h)
    }

    var IPX = 0
    var IPY = 50
    var IPZ= 0

    var to_player=function(id, x,y) {
        console.log("Player :  ID: "+id)
        IPX = float(x)
        IPZ = flipY(y)
        print "IPX=PX={:.0f};IPZ=PZ={:.0f};".format(IPX, IPZ, id)
    }

    var platform_overrides = {
        "svg_3": {"B":"0xffb"},
        "svg_10": {"B":"0x0ea"},
        "*": {"B":"0xfff"}
    }

    var to_platform=function(id,color,w,h,x,y) {
        print "/* Platform ID: {:6} */     ".format( id),
        if (color == '7fff00') {
            setGlobal(DR="textureDraw")
        }
        else if (color == '7f3f00'){
            setGlobal(DR="brickDraw");
        }
        else {
            print "\n/* >>>>>>>>>>>  Unknown rect: {} */".format(rect);
            return
        }

        if (platform_overrides[id])
            setGlobal(platform_overrides[id])
        else
            setGlobal(platform_overrides['*'])
        setGlobal(Y=_y)
        setGlobal(X="{:.0f}".format(float(x)))
        setGlobal(Z="{:.0f}".format(fixY(y,h)))
        setGlobal(W="{:.0f}".format(float(w)))
        setGlobal(H="{:.0f}".format(float(h)))
        print "addCube();"
    }

    var to_coins=function(id, x,y) {
        print "/* Coin ID: {:6}   */       ".format(id),
        print "addCoin({:.0f},{:.0f}); ".format(float(x),flipY(y))
    }

    var to_enemy=function(id, x,y) {
        print "/* Enemy ID: {:6}   */      ".format(id),
        print "addEnemy({:.0f},{:.0f}); ".format(float(x),flipY(y))
    }

    var process_ellipse=function(arc) {
        var color = arc.get('color')
        delete arc['color']
        if (color== '0000ff')
            to_player(arc)
        else if (color == 'ff7f00')
            to_enemy(arc)
        else if (color  == 'ffff00')
            to_coins(arc)
        else
            print "/* >>>>>>>>>>>>>>>>  unknown arc: {} */".format(arc)
    }


    var _y = 0

    print "PY=IPY={};Y=0; BW=27;BC=BBC;DR=brickDraw;D=100;\n".format(IPY)

    svg = svg.split('\n')
    for (var i=0; i<svg.length; i++) {
        var line =svg[i];
        //print line
        if (line.indexOf("<title>Back</title>") > -1) {
            print "/****  Back ****/"
            _y = 90
            setGlobal(Y=90, D=10)
            print ""
        }
        if (line.indexOf( "<title>Main</title>") > -1) {
            print "/***** Main ****/"
            _y=0
            setGlobal(Y=0, D=100)
            print ""
        }
        if (line.indexOf( "<title>Front (hiding)</title>") > -1) {
            _y=0
            print "/***** FRONT *****/"
            setGlobal(Y=0, D=10)
            print ""
        }

        var attributes = line.replace(rect_re, '$1')
        if (attributes != line) {
            var rect = {
                "id": line.replace(id_re, '$1'),
                "y": line.replace(y_re, '$1'),
                "x": line.replace(x_re, '$1'),
                "color": line.replace(fill_re, '$1'),
                "w": line.replace(width_re, '$1'),
                "h": line.replace(height_re, '$1')
            }

            to_platform(rect)
        }


        var attributes = line.replace(ellipse_re, '$1')
        if (attributes != line) {
            var ellipse = {
                "id": line.replace(id_re, '$1'),
                "y": line.replace(cy_re, '$1'),
                "x": line.replace(cx_re, '$1'),
                "color": line.replace(fill_re, '$1')
            }

            process_ellipse(ellipse)
        }
    }
}
