// "use strict";
//
// // NOTE: need to update track_missing_branches.js to test
//
// var chai = require('chai');
// const chaiAsPromised = require("chai-as-promised");
// chai.use(chaiAsPromised);
// const expect = chai.expect;
//
// const track_missing_branches = require('../index').track_missing_branches;
//
// it('creates all production/prodv* missing branches', function() {
//   return expect(track_missing_branches([
//     'master',
//     'upstream/production',
//     'origin/prodv4_6',
//     'origin/other'
//   ])).to.eventually.deep.equal([
//     'upstream/production',
//     'origin/prodv4_6'
//   ]);
// });
//
// it('creates nothing if all branches are present', function() {
//   return expect(track_missing_branches([
//     'master',
//     'production',
//     'upstream/production',
//     'origin/other'
//   ])).to.eventually.be.an('array').and.have.lengthOf(0);
// });
