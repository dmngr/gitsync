"use strict";

var chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const _ = require('lodash');

const index = require('../index');
const get_all_repos_names = new index().get_all_repos_names;
const fs = require('fs');
const home = require('os').homedir();

// NOTE: You may need to increase the timeout, depending on your internet
// connection speed.

var user;
var at;

before(function(done) {
  this.timeout(15000);
  fs.readFile(`${home}/.gitsync.json`, 'utf-8', function(err, data) {
    if (err) {
      console.log(err);
      done(err);

    } else {
      data = JSON.parse(data);
      user = data.user;
      at = data.at;
      done();
    }
  });
});

it('for org', function() {
  var org = true;
  var name = 'dmngr';
  var num_of_repos = 150;

  this.timeout(15000);
  // change number of repor
  return expect(get_all_repos_names(name, org, user, at)).to.eventually.be.an('array').and.have.lengthOf.above(num_of_repos);
});

it('for user', function() {
  var org = false;
  var name = 'ioanniswd';
  var num_of_repos = 10;

  this.timeout(15000);
  // change number of repor
  return expect(get_all_repos_names(name, org, user, at)).to.eventually.be.an('array').and.have.lengthOf.above(num_of_repos);
});
