#!/bin/bash

if [ ! -d /wikinote/data/.git ]; then
	echo "initialize wikinote data storage"
	cd /wikinote/data  && \
		git init && \
		git config user.name anonymous && \
		git config user.email anonymous@wikinote && \
		git commit -m "Initial commit" --allow-empty && \
		echo ".app/" >> .gitignore
fi

if [ ! -d /wikinote/data/.app/config.yaml ]; then
	cd /wikinote/src && \
		node wikinote.js  \
			--port 4000 \
			--wikinote-path /wikinote/data \
			--wikiname WikiNote \
			--front-page front-page \
			--save
else
	cd /wikinote/src && \
		node wikinote.js \
			--port 4000 \
			--wikinote-path /wikinote/data
fi

