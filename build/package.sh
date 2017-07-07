#!/usr/bin/env bash

cd "$(dirname "$0")"

source ./env.sh

rm -rf tmp
rm ../dist/*

version=$( sed -n 's/.*"version": "\(.*\)",/\1/p' ../manifest.json )
parts=( ${version//./ } )
((parts[2]++))
newVersion="${parts[0]}.${parts[1]}.${parts[2]}"
echo "Current version: $version"
echo "New version: $newVersion"

sed -i -e "s/\"version\": \"$version\",/\"version\": \"$newVersion\",/" ../manifest.json

mkdir -p tmp/sinkless
cp -r ../img tmp/sinkless
cp -r ../src tmp/sinkless
cp ../index.html tmp/sinkless
cp ../manifest.json tmp/sinkless
cp ../styles.css tmp/sinkless

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --pack-extension=./tmp/sinkless --pack-extension-key=./sinkless.pem

cp ./tmp/sinkless.crx ../dist

web-ext sign --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET --source-dir ..  --artifacts-dir ../dist --ignore-files "build" "dist" "img/screenshot.png" ".idea" ".git" ".gitignore" "genpass.js" "README.md"