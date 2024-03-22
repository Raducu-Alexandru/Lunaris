#!/bin/bash

rm -rf ./src/app/services
mkdir ./src/app/services
cd node_modules/@raducualexandrumircea;
for i in $(ls | grep service)
do
    if [[ "$i" == *".service"* ]]; then
        echo 'Copying service: ' $i
        cp -r $i/index.ts ../../src/app/services/$i.ts
    fi
done
