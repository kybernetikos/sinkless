#!/usr/bin/env bash

rm -rf tmp

mkdir -p tmp/sinkless
cp -r ../img tmp/sinkless
cp -r ../src tmp/sinkless
cp ../index.html tmp/sinkless
cp ../manifest.json tmp/sinkless
cp ../styles.css tmp/sinkless

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --pack-extension=./tmp/sinkless --pack-extension-key=./sinkless.pem

rm ../dist/*

cp tmp/sinkless.crx ../dist