#!/bin/bash

./wrap-as-modules.sh
../../node_modules/mocha/bin/mocha --reporter list .
