# !/bin/bash
# set -e

# Clean the output dir
rm -rf lib/
mkdir -p lib

# npx tsc

npx peggy --cache -o lib/parser.js src/glsl-extended.pegjs