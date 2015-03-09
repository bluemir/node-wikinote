#!/bin/bash

grunt &
nodemon -w app -w routes -w views -w app.js -w config.json -e html,js app.js
