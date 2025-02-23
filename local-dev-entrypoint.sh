#!/bin/bash

echo "Automatic test file asset creation"

if [ ! -f ./public/test-files/asset-index.json ]; then

  FAST_TEST_PAYLOAD_SIZES=(${FAST_TEST_PAYLOAD_SIZES:-0 25 50 100 250 500 1000})

  echo "No asset index found - Creating assets ..."

  rm -rf ./public/speedtest
  mkdir -p ./public/speedtest/assets

  for payload_size in "${FAST_TEST_PAYLOAD_SIZES[@]}"; do
    head -c $((payload_size * 1024 * 1024)) /dev/urandom > "./public/test-files/assets/${payload_size}-mibibytes"
  done

  for payload_size in "${FAST_TEST_PAYLOAD_SIZES[@]}"; do
      jq -n \
        --arg relative_path "assets/${payload_size}-mibibytes" \
        --arg expected_payload_bytes $((payload_size * 1024 * 1024)) \
        '{relative_path: $relative_path, expected_payload_bytes: $expected_payload_bytes}'
  done | jq -n '.assets |= [inputs]' > "./public/test-files/asset-index.json"

else
  echo "Asset index found - Skipping asset creation"
fi
echo "Automatic test file asset creation completed"