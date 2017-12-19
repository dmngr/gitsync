// "use strict";
//
// var Promise = require('bluebird');
//
// var chai = require('chai');
// const chaiAsPromised = require("chai-as-promised");
// chai.use(chaiAsPromised);
// const expect = chai.expect;
//
// const get_status = require('../index').get_status;
//
// it('for up to date repo', function() {
//   return expect(get_status()).to.eventually.equal('up-to-date');
// });
//
// it('for not up to date repo that can fast-forward', function() {
//   return expect(get_status()).to.eventually.equal('fast-forward');
// });
//
// it('for repo that is ahead', function() {
//   return expect(get_status()).to.eventually.equal('ahead');
// });
//
// it('for not up to date repo that has diverged', function() {
//   return expect(get_status()).to.eventually.equal('diverged');
// });
//
// it('for repo that has no remote', function() {
//   return expect(get_status()).to.eventually.equal('no_remote');
// });
