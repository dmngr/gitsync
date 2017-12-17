"use strict";

function import_test(name, path) {
  describe(name, function() {
    require(path);
  });
}

describe('TOP', function() {
  describe('Clone Module', function() {
    import_test('Is Path Valid Module', '../clone/test/is_path_valid');
    import_test('Get All Repos Names Module', '../clone/test/get_all_repos_names');
    import_test('Clone Repo Module', '../clone/test/clone_repo');
  });
});
