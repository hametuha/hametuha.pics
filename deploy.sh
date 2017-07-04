#!/usr/bin/env bash

set -e

cd app

# Pull git
git pull origin master

# Update modules
npm install
npm run build
npm run restart:p

