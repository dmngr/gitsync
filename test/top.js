"use strict";


/**
 * import_test
 *
 * @param  {type} name
 * @param  {type} path
 * @return {type}      
 */
function import_test(name, path) {
  describe(name, function() {
    require(path);
  });
}

describe('TOP', function() {
  describe('Clone Module', function() {
    import_test('Is Path Valid', '../src/clone/test/is_path_valid');
    import_test('Get All Repos Names', '../src/clone/test/get_all_repos_names');
    import_test('Clone Repo', '../src/clone/test/clone_repo');
  });

  describe('Pull module', function() {
    import_test('Get Existing Repos', '../src/pull/test/get_existing_repos');
    import_test('Get Status', '../src/pull/test/get_status');
    import_test('Pull All', '../src/pull/test/pull_all');
    import_test('Get All Branches', '../src/pull/test/get_all_branches');
    import_test('Track Missing Branches', '../src/pull/test/track_missing_branches');
  });
});
