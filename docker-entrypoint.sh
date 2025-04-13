#!/bin/bash

SPEED_CAT__RECREATE_PAYLOADS=${SPEED_CAT__RECREATE_PAYLOADS:false}
SPEED_CAT__TEST_FILE_ROOT="www"

source test-file-setup.sh

echo "SpeedCat is ready"

nginx -g 'daemon off;'