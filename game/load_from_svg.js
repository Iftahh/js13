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
            try {
                alert(t);
            }
            catch(e) {
                console.log("\n\n---------> "+t+"  <------\n\n")
            }
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

    var group_re = /<g id="([^"]+)">/
    var group_end_re = /<\/g>/

    var line_re = /<line( [^>]+)>/
    var x1_re = / x1="([^"]+)"/
    var x2_re = / x2="([^"]+)"/
    var y1_re = / y1="([^"]+)"/
    var y2_re = / y2="([^"]+)"/


    var int=function(n) {
        return Math.round(parseFloat(n))
    }
    var flipY=function(y) {
        return height-int(y) //-1*int(y)
    }
    var fixY=function(y,h) {
        return flipY(y)-int(h)
    }

    var fullLvl = [];
    var groups = [];
    var lvl = fullLvl;

    var to_player=function($) {
        var x = int($.x);
        var y = flipY($.y)
        lvl.push(0);
        lvl.push(x);
        lvl.push(y);
        console.log("Player   ID: "+ $.id +  "  at  "+x+", "+y)
    }

    var moving = {}

    var process_line=function(line) {
        var code = line.id.split(' ');
        if (code.length < 2) {
            safeAlert(">>>>> line with bad code "+line.id);
            return;
        }
        code = code[1].split('-')
        if (code[0] == "move") {
            moving[code[1]] = line;
            console.log("movment line ID: "+line.id)
        }
        else {
            safeAlert(">>>>> line with bad code "+line.id);
        }
    }

    var to_moving_platform=function($,line) {
        var w= int($.w),h= int($.h);
        // note $.x and $.y are ignored
        var color= $.color;
        var tt;
        if (color == '7fff00') {
            tt='grass'
            lvl.push(8)
        }
        else if (color == '7f3f00'){
            tt='brick'
            lvl.push(7)
        }
        else {
            safeAlert(">>>>  Unknown rect: color:"+color );
            return
        }
        var speed = 10;
        var code = $.id.split(' ');
        if (code.length > 1) {
            code = code[1].split('-')
            if (code[0] == "speed") {
                speed = int(code[1])
            }
            else {
                safeAlert(">>>>> platform with bad code "+$.id);
            }
        }
        var x1= int(line.x1), x2=int(line.x2), y1=fixY(line.y1,h), y2=fixY(line.y2,h);
        console.log("Moving Platform ID: "+line.id+"  "+tt+"  at "+x1+","+y1+" -> "+x2+","+y2+"  W:"+w+"  H:"+h)
        lvl.push(x1)
        lvl.push(y1)
        lvl.push(x2)
        lvl.push(y2)
        lvl.push(w)
        lvl.push(h)
        lvl.push(speed)
    }

    var to_platform=function($) {
        var id= $.id;
        if (moving[id]) {
            to_moving_platform($, moving[id]);
            return;
        }
        var color= $.color,w= $.w,h= $.h,x= $.x,y= $.y, broken= $.broken;
        var xx=int(x);
        var yy=fixY(y,h);
        var ww=int(w);
        var hh=int(h);

        var tt;
        if (color == '7fff00') {
            tt='grass'
            lvl.push(broken ?  13: 4)
        }
        else if (color == '7f3f00'){
            tt='brick'
            lvl.push(broken ? 12: 3)
        }
        else if (color == "bfbfbf") {
            tt= 'spikes'
            lvl.push(10)
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
        var code = $.id.split(' ');
        var speed = false;
        if (code.length > 1) {
            code = code[1].split('-')
            if (code[0] == "speed") {
                speed = int(code[1])
            }
            else {
                safeAlert(">>>>> line with bad code "+line.id);
            }
        }
        var x = int($.x);
        var y = flipY($.y)
        console.log("Enemy ID: "+ $.id+  "  at  "+x+", "+y+ "  speed: "+speed)
        if (speed) {
            lvl.push(9);
            lvl.push(x);
            lvl.push(y);
            lvl.push(speed)
        }
        else {
            lvl.push(2);
            lvl.push(x);
            lvl.push(y);
        }
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

    var to_group=function(id) {
        var speed = 10;
        var code = id.split(' ');
        if (code.length > 1) {
            id = code[0];
            code = code[1].split('-')
            if (code[0] == "speed") {
                speed = int(code[1])
            }
            else {
                safeAlert(">>>>> platform with bad code "+$.id);
            }
        }

        var group = []
        if (moving[id]) {
            var line = moving[id];
            var x1= int(line.x1), x2=int(line.x2), y1=fixY(line.y1,0), y2=fixY(line.y2,0); // unfortunately "h" isn't know at this point
            console.log("Starting moving group ID: "+line.id+"    at "+x1+","+y1+" -> "+x2+","+y2)
            lvl.push(11)
            lvl.push(x1)
            lvl.push(y1)
            lvl.push(x2)
            lvl.push(y2)
            lvl.push(speed)
        }
        else {
            console.log("Starting group ID: "+id);
            lvl.push(6)
        }
        lvl.push(group)
        groups.push(lvl);
        lvl = group;
    }

    var to_group_end=function() {
        if (groups.length) {
            lvl = groups.pop();
            console.log("ended group");
        }
    }



    svg = svg.split('\n')
    for (var i=0; i<svg.length; i++) {
        var text_line =svg[i];
        //print line
        if (text_line.indexOf("<title>Back</title>") > -1) {
            Y=100;
            D=10;
            console.log("****  Back ****  Y="+Y+", D="+D);
            lvl.push(5);
            lvl.push(Y)
            lvl.push(D)
            continue;
        }
        if (text_line.indexOf( "<title>Main</title>") > -1) {
            Y=0;
            D=100;
            console.log("***** Main ****  Y="+Y+", D="+D);
            lvl.push(5);
            lvl.push(Y)
            lvl.push(D)
            continue;
        }
        if (text_line.indexOf( "<title>Front (hiding)</title>") > -1) {
            Y=0;
            D=10;
            console.log("***** FRONT *****  Y="+Y+", D="+D);
            lvl.push(5);
            lvl.push(Y)
            lvl.push(D)
            continue;
        }

        var group_start = group_re.exec(text_line)
        if (group_start) {
            to_group(group_start[1])
            continue;
        }
        var group_end = group_end_re.exec(text_line)
        if (group_end) {
            to_group_end()
            continue;
        }

        var attributes = rect_re.exec(text_line)
        if (attributes) {
            attributes= attributes[1]
            var rect = {
                "id": id_re.exec(attributes)[1],
                "y": y_re.exec(attributes)[1],
                "x": x_re.exec(attributes)[1],
                "color": fill_re.exec(attributes)[1],
                "w": width_re.exec(attributes)[1],
                "h": height_re.exec(attributes)[1],
                "broken": attributes.indexOf('stroke-dasharray="2,2"') != -1
            }

            to_platform(rect)
            continue;
        }

        attributes = line_re.exec(text_line)
        if (attributes) {
            attributes=attributes[1];
            var line = {
                "id": id_re.exec(attributes)[1],
                "x1": x1_re.exec(attributes)[1],
                "y1": y1_re.exec(attributes)[1],
                "x2": x2_re.exec(attributes)[1],
                "y2": y2_re.exec(attributes)[1]
            }
            process_line(line)
            continue
        }

        attributes = ellipse_re.exec(text_line)
        if (attributes) {
            attributes = attributes[1];
            var ellipse = {
                "id": id_re.exec(attributes)[1],
                "y": cy_re.exec(attributes)[1],
                "x": cx_re.exec(attributes)[1],
                "color": fill_re.exec(attributes)[1]
            }

            process_ellipse(ellipse)
            continue;
        }
    }
    return lvl;
}
