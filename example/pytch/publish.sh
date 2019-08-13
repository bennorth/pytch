#!/bin/bash

# Script to publish the Pytch examples to pytch.org
# Assumes you have passwordless logins set up.

# Run this from the base Pytch directory
# e.g. examples/pytch/publish.sh

SSHOPTS=-C
SERVER=pytch.org
PUBLISHDIR=pytch.org/prototype

scp $SSHOPTS dist/skulpt-stdlib.js dist/skulpt.min.js $SERVER:$PUBLISHDIR/dist/
scp $SSHOPTS -r example/pytch-images/ example/pytch-audio/ $SERVER:$PUBLISHDIR/
scp $SSHOPTS example/pytch.html $SERVER:$PUBLISHDIR/
# Adjust the Skulpt file paths on published site
ssh $SSHOPTS pytch.org sed -i 's/\\\.\\\.\\/dist/dist/g' $PUBLISHDIR/pytch.html
ssh $SSHOPTS pytch.org ls $PUBLISHDIR
scp $SSHOPTS example/*.py $SERVER:$PUBLISHDIR/