#!/bin/bash

rm -rf wrapped-as-modules

pkg=pytch

mkdir -p wrapped-as-modules/$pkg

for m in project.js; do
    ( cat ../../src/lib/$pkg/$m
      echo
      echo 'var pymodule = $builtinmodule("...unused...");'
      echo 'module.exports = { python: pymodule, native: pymodule.$native };'
    ) > wrapped-as-modules/$pkg/$m
done
