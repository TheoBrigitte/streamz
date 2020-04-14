FROM node:alpine as builder
RUN apk --no-cache add \
        build-base \
        git \
        python3

WORKDIR /usr/src/app
COPY package.json .
COPY package-lock.json .
COPY public public
COPY src src
COPY Makefile .

RUN make build

FROM busybox
COPY --from=builder /usr/src/app/build /app
CMD ["cp", "-r", "/app/.", "/dst/"]
