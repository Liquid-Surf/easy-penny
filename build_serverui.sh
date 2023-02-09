#! /usr/bin/env bash
src_svg_foler="src_svg_$(date +%d-%m-%y_%H-%M-%S)"
trash src-build
cp -r src src-build
# trash src
mv src $src_svg_foler
rm src-build/pages/index.tsx src-build/pages/explore.tsx src-build/pages/turtle.tsx
mv src-build/pages/server_ui.tsx src-build/pages/\[\[...slug\]\].tsx
ln -s $PWD/src-build $PWD/src
NEXT_PUBLIC_MODE="integrate" npx next build &&
NEXT_PUBLIC_MODE="integrate" npx next export -o server-ui &&
mv 'server-ui/[[...slug]]/index.html' server-ui/index.html
trash src
mv $src_svg_foler src

