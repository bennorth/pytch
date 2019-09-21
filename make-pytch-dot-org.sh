#!/bin/bash

DIST_DIR=pytch-dot-org-content

rm -rf $DIST_DIR
mkdir $DIST_DIR

for fname in favicon.ico \
                 index.html \
                 pytch-gui.css \
                 pytch-gui.js \
                 jquery.dropdown.css \
                 jquery.dropdown.js \
             ; do
    cp example/pytch/"$fname" $DIST_DIR
done

for fname in skulpt.min.js skulpt-stdlib.js; do
    cp dist/"$fname" $DIST_DIR
done

mkdir $DIST_DIR/library $DIST_DIR/library/images
cp example/pytch/library/images/*.png $DIST_DIR/library/images

mkdir $DIST_DIR/library/sounds
cp example/pytch/library/sounds/*.mp3 $DIST_DIR/library/sounds


mkdir $DIST_DIR/examples
cp example/pytch/examples/*.py $DIST_DIR/examples

mkdir $DIST_DIR/doc
( cd example/pytch/doc && ./make-doc-pages.sh )
for fname in about.html help.html github-markdown.css; do
    cp example/pytch/doc/"$fname" $DIST_DIR/doc
done

tar zcf $DIST_DIR.tar.gz $DIST_DIR
