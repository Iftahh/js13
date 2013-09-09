// load level from SVG

if(typeof exports == 'undefined'){
    exports = window
}

function load_from_svg(svg) {
    loadLevel(svg_to_lvl(svg));
}

exports.svg_to_lvl = function(svg) {
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



    var int=function(n) {
        return Math.round(parseFloat(n))
    }
    var flipY=function(y) {
        return height-int(y) //-1*int(y)
    }
    var fixY=function(y,h) {
        return flipY(y)-int(h)
    }

    var lvl = [];


    var to_player=function($) {
        var x = int($.x);
        var y = flipY($.y)
        lvl.push(0);
        lvl.push(x);
        lvl.push(y);
        console.log("Player   ID: "+ $.id +  "  at  "+x+", "+y)
    }

    var to_platform=function($) {
        var id= $.id,color= $.color,w= $.w,h= $.h,x= $.x,y= $.y
        var xx=int(x);
        var yy=fixY(y,h);
        var ww=int(w);
        var hh=int(h);

        var tt;
        if (color == '7fff00') {
            tt='grass'
            lvl.push(4)
        }
        else if (color == '7f3f00'){
            tt='brick'
            lvl.push(3)
        }
        else {
            safeAlert(">>>>  Unknown rect: color:"+color );
            return
        }
        console.log("Platform ID: "+id+"  "+tt+"  at "+xx+", "+yy+"  W:"+ww+"  H:"+hh)
        lvl.push(xx)
        lvl.push(yy)
        lvl.push(ww)
        lvl.push(hh)
    }

    var to_coins=function($) {
        var x = int($.x);
        var y = flipY($.y)
        console.log("Coin ID: "+ $.id+  "  at  "+x+", "+y)
        lvl.push(1);
        lvl.push(x);
        lvl.push(y);
    }

    var to_enemy=function($) {
        var x = int($.x);
        var y = flipY($.y)
        console.log("Enemy ID: "+ $.id+  "  at  "+x+", "+y)
        lvl.push(2);
        lvl.push(x);
        lvl.push(y);
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



    svg = svg.split('\n')
    for (var i=0; i<svg.length; i++) {
        var line =svg[i];
        //print line
        if (line.indexOf("<title>Back</title>") > -1) {
            Y=90;
            D=10;
            console.log("****  Back ****  Y="+Y+", D="+D);
            lvl.push(5);
            lvl.push(Y)
            lvl.push(D)
        }
        if (line.indexOf( "<title>Main</title>") > -1) {
            Y=0;
            D=100;
            console.log("***** Main ****  Y="+Y+", D="+D);
            lvl.push(5);
            lvl.push(Y)
            lvl.push(D)
        }
        if (line.indexOf( "<title>Front (hiding)</title>") > -1) {
            Y=0;
            D=10;
            console.log("***** FRONT *****  Y="+Y+", D="+D);
            lvl.push(5);
            lvl.push(Y)
            lvl.push(D)
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
    return lvl;
}
