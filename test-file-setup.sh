#!/bin/bash


FAST_TEST__RECREATE_PAYLOADS=${FAST_TEST__RECREATE_PAYLOADS:false}
FAST_TEST__TEST_FILE_ROOT=${FAST_TEST__TEST_FILE_ROOT:"public"}

echo "Automatic test file asset creation"

  cd "$FAST_TEST__TEST_FILE_ROOT" || exit

  if [ "$FAST_TEST__RECREATE_PAYLOADS" = true ]; then
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