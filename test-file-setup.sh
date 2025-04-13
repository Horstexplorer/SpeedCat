#!/bin/bash

SPEED_CAT__RECREATE_PAYLOADS=${SPEED_CAT__RECREATE_PAYLOADS:false}
SPEED_CAT__TEST_FILE_ROOT=${SPEED_CAT__TEST_FILE_ROOT:"public"}

echo "Automatic test file asset creation"

  cd "$SPEED_CAT__TEST_FILE_ROOT" || exit

  if [ "$SPEED_CAT__RECREATE_PAYLOADS" = true ]; then
    rm -rf test-files
  fi

  jq -c '.testFiles[]' test-file-index.json | while read obj; do

    path=$(jq -r '.path' <<< $obj)
    byteSize=$(jq -r '.byteSize' <<< "$obj")
    mkdir -p $(dirname $path)

    if [ ! -f $path ]; then
      head -c $byteSize /dev/urandom > $path
    elif [ $(wc -c < $path) -ne $byteSize ]; then
        head -c $byteSize /dev/urandom > $path
    fi

  done;

echo "Automatic test file asset creation completed"