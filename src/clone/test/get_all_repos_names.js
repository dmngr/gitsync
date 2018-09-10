"use strict";

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const index = require('../index');
const get_all_repos_names = new index().get_all_repos_names;
const fs = require('fs');
const home = require('os').homedir();

// NOTE: You may need to increase the timeout, depending on your internet
// connection speed.

let user;
let at;


before(function(done) {
  this.timeout(120000);
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
  this.timeout(120000);

  const org = true;
  const name = 'dmngr';
  const num_of_repos = 150;

  // change number of repor
  return expect(get_all_repos_names(name, org, user, at)).to.eventually.be.an('array').and.have.lengthOf.above(num_of_repos);
});

it('for user', function() {
  this.timeout(120000);
  
  const org = false;
  const name = 'ioanniswd';
  const num_of_repos = 10;

  // change number of repor
  return expect(get_all_repos_names(name, org, user, at)).to.eventually.be.an('array').and.have.lengthOf.above(num_of_repos);
});
