#!/bin/bash

FAST_TEST__RECREATE_PAYLOADS=${FAST_TEST__RECREATE_PAYLOADS:false}
FAST_TEST__TEST_FILE_ROOT="www"

source test-file-setup.sh

echo "FastTest is ready"

nginx -g 'daemon off;'