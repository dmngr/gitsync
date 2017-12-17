"use strict";

function import_test(name, path) {
  describe(name, function() {
    require(path);
  });
}

describe('TOP', function() {
  describe('Clone Module', function() {
    import_test('Is Path Valid', '../clone/test/is_path_valid');
    import_test('Get All Repos Names', '../clone/test/get_all_repos_names');
    import_test('Clone Repo', '../clone/test/clone_repo');
  });

  describe('Pull module', function() {
    import_test('Get Existing Repos', '../pull/test/get_existing_repos');
    import_test('Get Status', '../pull/test/get_status');
    import_test('Pull All', '../pull/test/pull_all');
  });
});
