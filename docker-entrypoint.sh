#!/bin/bash

FAST_TEST_RECREATE_PAYLOADS=${FAST_TEST_RECREATE_PAYLOADS:false}
FAST_TEST__TEST_FILE_ROOT=www

./test-file-setup.sh

echo "FastTest is ready"

nginx -g 'daemon off;'