#!/bin/bash

if [ ! -d /wikinote/data/.git ]; then
	echo "initialize wikinote data storage"
	cd /wikinote/data  && \
		git init && \
		git config user.name anonymous && \
		git config user.email anonymous@wikinote && \
		git commit -m "Initial commit" --allow-empty
fi

cd /wikinote/src && \
	node wikinote.js

