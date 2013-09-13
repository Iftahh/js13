cd game
rm -f all.js
rm -f js13.zip

# order matters!
echo "(function() {" > all.js
cat consts.js >> all.js
cat jsfxr.js >> all.js
cat coins.js >> all.js
cat game.js >> all.js
cat enemy.js >> all.js
cat lvl1.js >> all.js
cat lvl2.js >> all.js
cat intro.js >> all.js
cat player.js >> all.js
cat loop.js >> all.js

echo "})()" >> all.js

java -jar ../../closure-compiler/compiler.jar   --js all.js   --js_output_file js13.js
zip js13.zip js13.js index.html
ls -lh js13.*

rm -f all.js
mv js13.zip ..
cd ..
