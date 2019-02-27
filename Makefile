NAME := streamz
DOCKER_IMAGE := theo01/${NAME}

VERSION := $(shell git describe --always --long --dirty --tags || date)

all: client

client: package publish

build:
	npm run build

package:
	@docker build -t ${DOCKER_IMAGE} .

publish:
	@docker push ${DOCKER_IMAGE}

run:
	npm start

.PHONY: client build package publish run
