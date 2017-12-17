"use strict";

var chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const pull_all = require('../src/index').pull_all;

it('pulls all branches', function() {
  return expect(pull_all(process.cwd())).to.eventually.equal(`Pulled ${process.cwd()}`);
});
