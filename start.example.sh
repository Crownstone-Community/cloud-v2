#!/usr/bin/env bash
export SSE_TOKEN="SSE_TOKEN"
export SANITATION_TOKEN="SANITATION_TOKEN"
export AGGREGATION_TOKEN="AGGREGATION_TOKEN"

export ALLOW_IMPORT="YES"

# this is the local mongo instance
export FILES_DB_URL="mongodb://localhost:27017/files_v1"
export DATA_DB_URL="mongodb://localhost:27017/data_v1"
export USER_DB_URL="mongodb://localhost:27017/users_v1"

node execute.js


