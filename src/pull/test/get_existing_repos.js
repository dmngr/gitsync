"use strict";

var Promise = require('bluebird');

var chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const fs = Promise.promisifyAll(require('fs'));
const home = require('os').homedir();

const get_existing_repos = require('../index').get_existing_repos;

it('return correct repos names', function() {
  return expect(get_existing_repos()).to.eventually.be.an('array').that.has.lengthOf(4);
});
