#!/bin/bash

# Script to publish the Pytch examples to pytch.org
# Assumes you have passwordless logins set up.

# Run this from the base Pytch directory
# e.g. examples/pytch/publish.sh

SERVER=pytch.org
PUBLISHDIR=pytch.org/prototype

scp dist/skulpt-stdlib.js dist/skulpt.min.js $SERVER:$PUBLISHDIR/dist/
scp -r example/pytch-images/ example/pytch-audio/ $SERVER:$PUBLISHDIR/
scp example/pytch.html $SERVER:$PUBLISHDIR/
scp example/*.py $SERVER:$PUBLISHDIR/
