var sys = require('sys'),
    fs = require('fs'),
    lfs = require('../game/load_from_svg')

if (process.argv.length < 3) {
    sys.error("expected:  node svg_to_lvl.js  <input-svg-file> ")
    process.exit();
}

height = 760;

console.log("Processing "+process.argv[2])
var svg = fs.readFileSync(process.argv[2], 'utf8');
var lvl = lfs.svg_to_lvl(svg)
var r = /\/([^.\/]+)\.[^\.]+$/
var lvlname = process.argv[2].split(r)[1]
fs.writeFileSync("game/"+lvlname+".js", "var "+lvlname+" = "+JSON.stringify(lvl)+";");
