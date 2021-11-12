#!/bin/bash

# this is a workaround for batch conversion not working on windows: https://github.com/GoogleChromeLabs/squoosh/issues/973
# ideally it would just be:
# squoosh-cli -d ./src/assets/textures/ --oxipng auto ./src/assets/textures/*.png

files=$(find ./src/assets/textures/*.png)
for file in $files
do
  echo "squooshing $file"
  squoosh-cli -d ./src/assets/textures --oxipng auto "$file"
done
