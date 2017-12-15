"use strict";

function import_test(name, path) {
  describe(name, function() {
    require(path);
  });
}

describe('top', function() {
});
