#!/usr/bin/env node

"use strict";

var Promise = require('bluebird');

const exec = Promise.promisify(require('child_process').exec);
const find = Promise.promisifyAll(require('find'));
const homedir = require('os').homedir();
const colors = require('colors/safe');
const Git = require("nodegit");

// exec('find . -type d -regextype sed -regex ".*/^(.git)^(node_modules)/g"');
