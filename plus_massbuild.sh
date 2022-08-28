if [ ! -f .env ]
then
  export $(cat .prod.plus.env | xargs)
fi


PLUS_DOCKER_BUILD_TAG=$(curl -s 'https://api.github.com/repos/sct/overseerr/tags' | python3 -c 'import json,sys;obj=json.load(sys.stdin);print(obj[0]["name"])')


BUILD_ARGS="--build-arg PLUS_DOCKER_BUILD_TAG='${PLUS_DOCKER_BUILD_TAG}' \
--build-arg COMMIT_TAG='${COMMIT_TAG}' \
--build-arg PLUS_ENV='${PLUS_ENV}' \
--build-arg PLUS_COMMIT_TAG='${PLUS_COMMIT_TAG}' \
--build-arg PLUS_GIT_BRANCH='${PLUS_GIT_BRANCH}'"

BUILD_PLATFORMS="linux/amd64,linux/amd64/v2,linux/amd64/v3,linux/arm64"

echo
echo "Building for platforms: ${BUILD_PLATFORMS}."
echo "  BUILD ARGS -> \n\t ${BUILD_ARGS} "
echo
docker buildx build --push --platform "linux/amd64,linux/amd64/v2,linux/amd64/v3,linux/arm64" $BUILD_ARGS -f "Dockerfile" -t jameswrc/overseerrplus:latest "."
# docker_build_cmd+=" --amend jameswrc/overseerrplus:${platform}"
# for platform in ${BUILD_PLATFORMS[@]}; do
# echo "Building for platform: ${platform}. ${#BUILD_PLATFORMS[@]}"
# docker buildx build --push --platform linux/arm64/v8 $BUILD_ARGS --pull --rm -f "Dockerfile.plus.prod" -t jameswrc/overseerrplus:arm64v8 "."
# done
# docker buildx build --push --platform linux/arm64/v8 $BUILD_ARGS --pull --rm -f "Dockerfile.plus.prod" -t jameswrc/overseerrplus:arm64v8 "."
# docker buildx build --push --platform linux/arm64 $BUILD_ARGS --pull --rm -f "Dockerfile.plus.prod" -t jameswrc/overseerrplus:arm64 "."
# docker buildx build --push --platform linux/amd64 $BUILD_ARGS --pull --rm -f "Dockerfile.plus.prod" -t jameswrc/overseerrplus:amd64 "."

# eval $docker_build_cmd

# --amend jameswrc/overseerrplus:arm64v8 \
# --amend jameswrc/overseerrplus:arm64 \
# --amend jameswrc/overseerrplus:amd64 \

# docker manifest push jameswrc/overseerrplus:latest