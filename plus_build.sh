#!/usr/bin/env bash
BUILD_ENV=${1}              # Build for ENV or PROD
RUN_ON_BUILD=${2}           # Run after build (DEV env only)
RUN_ON_BUILD_ARGS=${3}      # Docker build args (DEV env ONLY)


CMD_VALID=false
PLUS_DOCKER_BUILD_TAG="dev"
PLUS_GIT_BRANCH="plus/develop"


# Check script arguments are valid
if [ "${BUILD_ENV}" == "PROD" ] || [ "${BUILD_ENV}" == "STAGING" ] || [ "${BUILD_ENV}" == "DEV" ]; then
    CMD_VALID=true
fi

if [ $CMD_VALID == false ]; then
    echo
    echo "Build args invalid!"
    echo
    echo "Usage: ./plus_build [ PROD || STAGING || DEV ] [ARGS]"
    echo "ARGS: "
    echo "run                  | stop and rerun the container. For DEV build only."
    echo "run -d               | stop and rerun the container detached. For DEV build only."
    echo


    exit

fi

# Determine the git branch for the current build
if [ "${BUILD_ENV}" == "PROD" ]; then
    PLUS_GIT_BRANCH="plus/main"
fi

if [ "${BUILD_ENV}" == "STAGING" ]; then
    PLUS_GIT_BRANCH="plus/staging"
fi

# Set the build tag and get latest tags from respective repos
if [ "${BUILD_ENV}" == "PROD" ]; then

    # Set build tag
    PLUS_DOCKER_BUILD_TAG="latest"

fi

# Set the build tag and get latest tags from respective repos
if [ "${BUILD_ENV}" == "STAGING" ]; then

    # Set build tag
    PLUS_DOCKER_BUILD_TAG="beta"

fi

# Set the build tag and get latest tags from respective repos
if [ "${BUILD_ENV}" == "DEV" ]; then

    # Set build tag
    PLUS_DOCKER_BUILD_TAG="dev"

fi

# Get lastest commit SHA from overseerr releases.
latestOverseerrReleaseTag=$(curl -s 'https://api.github.com/repos/sct/overseerr/tags' | python3 -c 'import json,sys;obj=json.load(sys.stdin);print(obj[0]["name"])')

# Get latest release tag from overseerrPlus releases.
latestOverseerrPlusReleaseTag=$(curl -s "https://api.github.com/repos/JamesWRC/overseerrPlus/releases" | python3 -c 'import json,sys;releases=json.load(sys.stdin); print([rel.get("tag_name") for rel in releases if rel.get("target_commitish") == "plus/main" ][0]) ')


# Print the latest releases for Overseerr and OverseerrPlus from git.
echo
echo "Git Releases: "
echo " - Overseerr: $latestOverseerrReleaseTag"
echo " - OverseerrPlus: $latestOverseerrPlusReleaseTag"
echo

# Set the file name for the docker-compose file
if [ "${BUILD_ENV}" == "STAGING" ]; then
    ENV_FILE_NAME=$(echo "PROD" | tr '[:upper:]' '[:lower:]')
else
    ENV_FILE_NAME=$(echo "${BUILD_ENV}" | tr '[:upper:]' '[:lower:]')
fi

echo
echo "Building ${BUILD_ENV} - OverseerrPlus"
sleep 3
echo
echo "Docker Build Args:"
echo " - COMMIT_TAG: $latestOverseerrReleaseTag"
echo " - PLUS_COMMIT_TAG: $latestOverseerrPlusReleaseTag"
echo " - PLUS_BUILD_ENV: $BUILD_ENV"
echo " - ENV_FILE_NAME: $ENV_FILE_NAME"
echo " - PLUS_DOCKER_BUILD_TAG: $PLUS_DOCKER_BUILD_TAG"
echo " - PLUS_GIT_BRANCH: $PLUS_GIT_BRANCH"
echo

# Put env vars into .env file based on build environment
# echo "\
# COMMIT_TAG=$latestOverseerrReleaseTag
# PLUS_COMMIT_TAG=$latestOverseerrPlusReleaseTag
# PLUS_BUILD_ENV=$BUILD_ENV
# PLUS_DOCKER_BUILD_TAG=$PLUS_DOCKER_BUILD_TAG
# PLUS_GIT_BRANCH=$PLUS_GIT_BRANCH

# " > ."${ENV_FILE_NAME}".plus.env 

# Export env variable for build tag
export PLUS_DOCKER_BUILD_TAG=$PLUS_DOCKER_BUILD_TAG
buildCMD="docker-compose -f 'docker-compose.plus.${ENV_FILE_NAME}.yml' build\
 --build-arg PLUS_DOCKER_BUILD_TAG='$PLUS_DOCKER_BUILD_TAG'\
 --build-arg COMMIT_TAG='$latestOverseerrReleaseTag'\
 --build-arg PLUS_ENV='$BUILD_ENV'\
 --build-arg PLUS_COMMIT_TAG='$latestOverseerrPlusReleaseTag'\
 --build-arg PLUS_GIT_BRANCH='$PLUS_GIT_BRANCH'"
 


# Add docker build arguments for production or staging
if [ "${BUILD_ENV}" == "PROD" ] || [ "${BUILD_ENV}" == "STAGING" ]; then
    buildCMD="${buildCMD} --no-cache"
fi

echo "Building image..."
echo "$buildCMD"
echo

# sleep for 5 seconds to allow users to cancel a build
sleep 5
# Run the build command
bash -c "${buildCMD}"

# Stop and run image if specified 
buildCMD="docker-compose -f 'docker-compose.plus.${ENV_FILE_NAME}.yml' up ${RUN_ON_BUILD_ARGS}"
if [ "${RUN_ON_BUILD}" == "run" ]; then
    echo "${buildCMD}"
    sleep 3
    bash -c "${buildCMD}"
else
    echo "To run container: "
    echo "${buildCMD}"
fi
#docker-compose -f "docker-compose.plus.yml" up -d