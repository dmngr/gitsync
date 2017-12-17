"use strict";

var Promise = require('bluebird');

var chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

// console.log('__dirname:', __dirname);
const cloneRepo = require('../src/index').clone_repo;
const fs = Promise.promisifyAll(require('fs'));
const home = require('os').homedir();
const exec = Promise.promisify(require('child_process').exec, {
  multiArgs: true
});

// NOTE: You may need to increase the timeout, depending on your internet
// connection speed.

describe('Clone Repo Module', function() {
  var repo_1;
  var repo_2;
  var at;

  before(function(done) {
    this.timeout(15000);
    fs.readFileAsync(`${home}/.gitsync.json`, 'utf-8')
      .then(data => {
        data = JSON.parse(data);
        repo_1 = data.test_repo_1;
        repo_2 = data.test_repo_2;
        at = data.at;
        done();
      })
      .catch(err => {
        throw err;
      });
  });

  it('correct path', function() {
    this.timeout(15000);
    // console.log('repo_1:', repo_1);
    return expect(cloneRepo(repo_1, at)).to.eventually.equal(`test/path/${repo_1.name}`);
  });

  it('wrong path', function() {
    this.timeout(15000);
    // console.log('repo_2:', repo_2);
    return expect(cloneRepo(repo_2, at)).to.eventually.equal("");
  });

  after(function(done) {
    this.timeout(15000);
    exec('rm -R ./tmp')
      .spread((stdout, stderr) => {
        // console.log('stdout:', stdout);
        // console.log('stderr:', stderr);
        // console.log('dirname:', __dirname);
        // console.log('process.cwd():', process.cwd());
        return exec(`rm -R ${process.cwd()}/test/path`);
      })
      .spread((stdout, stderr) => {
        // console.log('stdout:', stdout);
        // console.log('stderr:', stderr);

        done();
      })
      .catch(err => {
        throw err;
      });
  });

});
