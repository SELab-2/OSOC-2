const TestSequencer = require('@jest/test-sequencer').default;

const directories = {
  'tests': 0,
  'orm_unit': 1,
  'orm_integration': 2,
  'routes_unit': 3,
  'routes_integration': 4
};

class SortByDir extends TestSequencer {
  sort(tests) {
    return tests.map(x => {
      const tmp = x.path.split('/');
      return { test: x, dir: directories[tmp[tmp.length - 2]], fl: tmp[tmp.length - 1] };
    }).sort((one, other) => {
      const dirOrder = one.dir - other.dir;
      if(dirOrder == 0) {
        return one.fl.localeCompare(other.fl, 'en');
      }
      return dirOrder;
    }).map(x => x.test);
  }
}

module.exports = SortByDir;
