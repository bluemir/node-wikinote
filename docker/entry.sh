#!/bin/bash

if [ ! -d /home/wikinote/data/.git ]; then
	echo "initialize wikinote data storage"
	cd /home/wikinote/data  && \
		git init && \
		git config user.name anonymous && \
		git config user.email anonymous@wikinote && \
		git commit -m "Initial commit" --allow-empty
fi

cd /home/wikinote/src && \
	node wikinote.js

