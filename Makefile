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

deploy:
	@docker run --rm \
            -e SSH_ID_RSA="$(SSH_ID_RSA)" \
            -e SSH_KNOWN_HOSTS="$(SSH_KNOWN_HOSTS)" \
	    theo01/docker-systemctl:latest \
	    -H $(SSH_HOST) \
	    restart $(shell basename systemd/*)

run:
	npm start

.PHONY: client build package publish run
