NAME := streamz
DOCKER_IMAGE := theo01/${NAME}

all: client

client: package publish

build:
	npm ci --only=production
	npm run build

package:
	@docker build -t ${DOCKER_IMAGE} .

publish:
	@docker push ${DOCKER_IMAGE}

run:
	npm start

.PHONY: client build package publish run
