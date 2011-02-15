#!/bin/bash

if [ -z $(which unzip) ]
then
    echo "you must install unzip"
    exit
fi
if [ -z "$1" ]
then
    echo usage:
    echo $0 path/to/minecraft.jar
    exit
fi

resource_names="armor art environment font gui item misc mob terrain terrain.png"
tmp_stash=$(mktemp -d)

unzip -q -d $tmp_stash "$1"

if [ ! -f "$tmp_stash/terrain.png" ]
then
    echo It looks like you tried to extract from the launcher.
    echo This script needs the actual game jar file, usually in ApplicationData or ~/.minecraft.
    exit
fi

for resource_name in $resource_names
do
    cp -r {$tmp_stash,$(dirname $0)/resources}/$resource_name
done

rm -rf $tmp_stash

