var sys = require('sys'),
    fs = require('fs'),
    lfs = require('../game/load_from_svg')

if (process.argv.length < 4) {
    sys.error("expected:  node svg_to_lvl.js  <input-svg-file> <output-js-lvl-file>")
    process.exit();
}

height = 760;


var svg = fs.readFileSync(process.argv[2], 'utf8');
var lvl = lfs.svg_to_lvl(svg)
var r = /\/([^.\/]+)\.[^\.]+$/
var lvlname = process.argv[3].split(r)[1]
fs.writeFileSync(process.argv[3], "var "+lvlname+" = "+JSON.stringify(lvl)+";");
