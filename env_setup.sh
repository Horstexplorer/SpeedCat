#!/bin/bash

function configure_environment_variables() {
    echo "Configuring Environment Variables"
    export FAST_TEST_PAYLOAD_SIZES=(${FAST_TEST_PAYLOAD_SIZES:-0 25 50 100 250 500 1000})
    export FAST_TEST_INITIALIZATION_MODE="${FAST_TEST_INITIALIZATION_MODE:-FILE}" # FILE OR SCRIPT

    export FAST_TEST_ASSET_ROOT_LOCATION="${FAST_TEST_ASSET_ROOT_LOCATION:-./public/speedtest}" # ./public/speedtest should be fine
    export FAST_TEST_ASSET_LOCATION="assets"
    export FAST_TEST_ASSET_SCRIPT_LOCATION="scripts"
}

function create_file_payloads() {
    echo "Creating File Payloads"
    # Create Asset Location
    mkdir -p "$FAST_TEST_ASSET_LOCATION"
    # Create Payload Files
    for payload_size in "${FAST_TEST_PAYLOAD_SIZES[@]}"; do
      head -c $((payload_size * 1024 * 1024)) /dev/urandom > "${FAST_TEST_ASSET_ROOT_LOCATION}/${FAST_TEST_ASSET_LOCATION}/${payload_size}_mibibytes"
    done
    # Create Asset Index
    create_asset_index_file_for_payloads
}

function create_script_payloads() {
    echo "Creating Script Payloads"
    if [ ! -f "/dev/fuse" ]; then
      exit 1
    fi
    # Create Asset Location
    mkdir -p "$FAST_TEST_ASSET_LOCATION"
    # Create Asset Script Location
    mkdir -p "$FAST_TEST_ASSET_SCRIPT_LOCATION"
    # Create Payload Scripts
    for payload_size in "${FAST_TEST_PAYLOAD_SIZES[@]}"; do
      echo "#!/bin/bash" >> "${FAST_TEST_ASSET_SCRIPT_LOCATION}/${payload_size}_mibibytes"
      echo "head -c $((payload_size * 1024 * 1024)) /dev/urandom" >> "${FAST_TEST_ASSET_ROOT_LOCATION}/${FAST_TEST_ASSET_SCRIPT_LOCATION}/${payload_size}_mibibytes"
    done
    # Create Asset Index
    create_asset_index_file_for_payloads
    # Configure Filesystem
    scriptfs "${FAST_TEST_ASSET_ROOT_LOCATION}/${FAST_TEST_ASSET_SCRIPT_LOCATION}" "${FAST_TEST_ASSET_ROOT_LOCATION}/$FAST_TEST_ASSET_LOCATION"
}

function create_asset_index_file_for_payloads() {
  echo "Creating Asset Index File"
    for payload_size in "${FAST_TEST_PAYLOAD_SIZES[@]}"; do
        jq -n \
          --arg relative_path "${FAST_TEST_ASSET_LOCATION}/${payload_size}_mibibytes" \
          --arg expected_payload_bytes $((payload_size * 1024 * 1024)) \
          '{relative_path: $relative_path, expected_payload_bytes: $expected_payload_bytes}'
    done | jq -n '.assets |= [inputs]' > "${FAST_TEST_ASSET_ROOT_LOCATION}/asset-index.json"
}

configure_environment_variables
create_file_payloads