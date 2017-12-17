"use strict";

var chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const _ = require('lodash');

const get_all_repos_names = require('../index').get_all_repos_names;
const fs = require('fs');
const home = require('os').homedir();

// NOTE: You may need to increase the timeout, depending on your internet
// connection speed.


describe('for user', function() {
  var org = false;
  var name = 'ioanniswd';

  var user;
  var at;

  before(function(done) {
    this.timeout(15000);
    fs.readFile(`${home}/.wsinit.json`, 'utf-8', function(err, data) {
      if(err) {
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

  it('returns correct array', function(done) {
    get_all_repos_names(name, org, user, at)
    .then(arr => {
      expect(arr).to.be.an('array').and.have.lengthOf.above(10);
      _.each(arr, item => expect(item).to.have.all.keys(['name', 'full_name', 'local_path']));
      done();
    })
    .catch(err => {
      throw err;
    });
  });
});
