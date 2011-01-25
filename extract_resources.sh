#!/bin/bash

# TODO: check usage, location, and unzip

resource_names=armor art environment font gui item misc mob terrain terrain.png
tmp_stash=$(mktemp -d)

unzip -q -d $tmp_stash $1

for resource_name in $resource_names
do
    cp -r {$tmp_stash,resources}/$resource_name
done

rm -rf $tmp_stash

