#!/usr/bin/env bash

#
# Run mongo-express GUI tool.
#
# Documentation: https://hub.docker.com/_/mongo-express.
#

#
# TODO By default mongodb allows connections
# from localhost only. See output of command
# ```
# sudo netstat -tulpn | grep :3001 ;
# ```
#
# ME_CONFIG_MONGODB_SERVER="host.docker.internal"
#

ME_CONFIG_MONGODB_SERVER="localhost"
NET="host" # We must run on net "host", because of TODO above.

ME_CONFIG_MONGODB_PORT="3001"

# TODO This option doesn't work!
# Port that mongo-express will run on.
PORT="8090"

docker run -it --rm \
    --name mongo-express \
    --net="${NET}" \
    -p "${PORT}:${PORT}" \
    -e PORT="${PORT}" \
    -e ME_CONFIG_OPTIONS_EDITORTHEME="ambiance" \
    -e ME_CONFIG_MONGODB_SERVER="${ME_CONFIG_MONGODB_SERVER}" \
    -e ME_CONFIG_MONGODB_PORT="${ME_CONFIG_MONGODB_PORT}" \
    --add-host=host.docker.internal:host-gateway \
    mongo-express:1.0.0-alpha.4
