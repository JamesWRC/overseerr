
BUILD_ARGS="--build-arg PLUS_DOCKER_BUILD_TAG='latest' \
--build-arg COMMIT_TAG='v1.29.1' \
--build-arg PLUS_ENV='PROD' \
--build-arg PLUS_COMMIT_TAG='v0.0.1' \
--build-arg PLUS_GIT_BRANCH='plus/production'"

docker buildx build --push --platform linux/arm64/v8 $BUILD_ARGS --pull --rm -f "Dockerfile.plus.prod" -t jameswrc/overseerrplus:arm64v8 "."
docker buildx build --push --platform linux/arm64 $BUILD_ARGS --pull --rm -f "Dockerfile.plus.prod" -t jameswrc/overseerrplus:arm64 "."
docker buildx build --push --platform linux/amd64 $BUILD_ARGS --pull --rm -f "Dockerfile.plus.prod" -t jameswrc/overseerrplus:amd64 "."

docker manifest create \
jameswrc/overseerrplus:latest \
--amend jameswrc/overseerrplus:arm64v8 \
--amend jameswrc/overseerrplus:arm64 \
--amend jameswrc/overseerrplus:amd64 \

docker manifest push jameswrc/overseerrplus:latest