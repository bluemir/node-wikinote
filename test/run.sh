#!/bin/bash

grunt &
nodemon -w app -w routes -w views -w wikinote.js -w config.json -e html,js wikinote.js 
