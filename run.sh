#! /bin/bash

set -xe

docker compose build
docker compose up -d
