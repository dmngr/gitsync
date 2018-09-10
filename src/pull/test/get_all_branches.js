"use strict";

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const get_all_branches = require('../index').get_all_branches;

it('returns all branches', function() {
  return expect(get_all_branches()).to.eventually.deep.equal([
    'master',
    'origin/master'
  ]);
});
