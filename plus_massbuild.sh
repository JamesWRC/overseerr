if [ ! -f .env ]
then
  export $(cat .prod.plus.env | xargs)
fi


if [ "${BUILD_ENV}" == "PROD" ]; then

    # Set build tag
    PLUS_DOCKER_BUILD_TAG="latest"

fi

if [ "${BUILD_ENV}" == "STAGING" ]; then

    # Set build tag
    PLUS_DOCKER_BUILD_TAG="beta"

fi

if [ "${BUILD_ENV}" == "DEV" ]; then

    # Set build tag
    PLUS_DOCKER_BUILD_TAG="dev"

fi

COMMIT_TAG=$(curl -s 'https://api.github.com/repos/sct/overseerr/tags' | python3 -c 'import json,sys;obj=json.load(sys.stdin);print(obj[0]["name"])')
BUILD_ARGS="--build-arg PLUS_DOCKER_BUILD_TAG='${PLUS_DOCKER_BUILD_TAG}' \
--build-arg COMMIT_TAG='${COMMIT_TAG}' \
--build-arg PLUS_ENV='${BUILD_ENV}' \
--build-arg PLUS_COMMIT_TAG='${PLUS_COMMIT_TAG}' \
--build-arg PLUS_GIT_BRANCH='${PLUS_GIT_BRANCH}'"

BUILD_PLATFORMS="linux/amd64,linux/amd64/v2,linux/amd64/v3,linux/arm64"

echo
echo "Building for platforms: ${BUILD_PLATFORMS}."
echo "  BUILD ARGS -> \n\t ${BUILD_ARGS} "
echo

cmd="docker buildx build --push --platform $BUILD_PLATFORMS $BUILD_ARGS -f Dockerfile -t jameswrc/overseerrplus:$PLUS_DOCKER_BUILD_TAG ."

eval $cmd
