FROM node:22-bookworm as build-env

WORKDIR /app

COPY package.json /app
COPY package-lock.json /app

RUN --mount=type=cache,sharing=shared,id=npm_cache,target=/root/.npm npm install

COPY . .

ARG BUILD_TIME
ARG BUILD_VERSION
ARG BUILD_REVISION

#RUN sed -i -e "s#__DEV_DIRTY__#${BUILD_VERSION}-${BUILD_REVISION}#g" src/main.js

CMD ["/nodejs/bin/node", "--enable-source-maps", "/app/src/tuya-mqtt.js"]


#FROM gcr.io/distroless/nodejs22-debian12
#
#COPY --from=busybox:1.35.0-uclibc /bin/sh /bin/sh
#COPY --from=busybox:1.35.0-uclibc /bin/tar /bin/tar
#
#COPY --from=build-env /app/dist /app
#COPY --from=build-env /app/node_modules /app/node_modules
#
#ENTRYPOINT []
#


