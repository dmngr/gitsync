"use strict";

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const get_existing_repos = require('../index').get_existing_repos;

it('return correct repos names', function() {
  return expect(get_existing_repos()).to.eventually.be.an('array').that.has.lengthOf(1);
});
