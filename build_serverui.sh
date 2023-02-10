#! /usr/bin/env bash
src_svg_foler="src_svg_$(date +%d-%m-%y_%H-%M-%S)"
trash /tmp/src-build
cp -r src /tmp/src-build
# trash src
mv src $src_svg_foler
rm /tmp/src-build/pages/index.tsx /tmp/src-build/pages/explore.tsx /tmp/src-build/pages/turtle.tsx
mv /tmp/src-build/pages/server_ui.tsx /tmp/src-build/pages/\[\[...slug\]\].tsx
mv /tmp/src-build $PWD/src
NEXT_PUBLIC_MODE="integrate" npx next build &&
NEXT_PUBLIC_MODE="integrate" npx next export -o server-ui &&
mv 'server-ui/[[...slug]]/index.html' server-ui/index.html
trash src
mv $src_svg_foler src

