#!/bin/bash

DIST_DIR=pytch-dot-org-content

rm -rf $DIST_DIR
mkdir $DIST_DIR

cp example/pytch.html $DIST_DIR

# Might be nice to have a different index page some day, but not today!
cp example/pytch.html $DIST_DIR/index.html

cp example/jquery.dropdown.css example/jquery.dropdown.js $DIST_DIR
cp example/soundfont-player.min.js $DIST_DIR
cp example/pytch-gui.css example/pytch-gui.js $DIST_DIR

mkdir $DIST_DIR/dist
cp dist/skulpt-stdlib.js dist/skulpt.min.js $DIST_DIR/dist

mkdir $DIST_DIR/pytch-images
cp example/pytch-images/*.png $DIST_DIR/pytch-images

mkdir $DIST_DIR/pytch-sounds
cp example/pytch-sounds/*.mp3 $DIST_DIR/pytch-sounds

cp example/make-a-chase-game.py example/pong.py example/balloon-pop.py $DIST_DIR

mkdir $DIST_DIR/pytch-doc
( cd doc/pytch && ./make-doc-pages.sh )
cp doc/pytch/about.html doc/pytch/help.html doc/pytch/github-markdown.css $DIST_DIR/pytch-doc

tar zcf $DIST_DIR.tar.gz $DIST_DIR
