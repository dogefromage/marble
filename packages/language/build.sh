# !/bin/bash
# set -e

# Clean the output dir
rm -rf lib/
mkdir -p lib

# npx tsc

# npx ts-pegjs --cache -o lib/parser.js src/glsl-extended.pegjs
npx peggy --cache -o lib/parser.js src/glsl-extended.pegjs