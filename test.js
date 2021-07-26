const test = require('tape');
const dropRepeats = require('.');

const TYPES = {
  FUNCTION: 'function',
  NUMBER: 'number',
  OBJECT: 'object',
  STRING: 'string',
  UNDEFINED: 'undefined',
}

test('it drops consecutive repeated values from a pullable source without a predicate function', function (t) {
  t.plan(26);
  const upwardsExpected = [
    [0, TYPES.FUNCTION],
    [1, TYPES.UNDEFINED],
    [1, TYPES.UNDEFINED],
    [1, TYPES.UNDEFINED],
    [1, TYPES.UNDEFINED]
  ];
  const downwardsExpectedType = [
    [0, TYPES.FUNCTION],
    [1, TYPES.NUMBER],
    [1, TYPES.NUMBER],
    [2, TYPES.UNDEFINED]
  ];
  const downwardsExpected = [1, 2];

  function makeSource() {
    let sink;
    let sent = 0;
    return function source(type, data) {
      t.true(upwardsExpected.length > 0, 'source can be pulled');
      const e = upwardsExpected.shift();
      t.equals(type, e[0], 'upwards type is expected: ' + e[0]);
      t.equals(typeof data, e[1], 'upwards data is expected: ' + e[1]);

      if (type === 0) {
        sink = data;
        return sink(0, source);
      }
      if (sent === 3) {
        return sink(2);
      }
      if (sent === 0) {
        sent++;
        return sink(1, 1);
      }
      if (sent === 1) {
        sent++;
        return sink(1, 1);
      }
      if (sent === 2) {
        sent++;
        return sink(1, 2);
      }
    };
  }

  function makeSink() {
    let ask;
    return (type, data) => {
      const et = downwardsExpectedType.shift();
      t.equals(type, et[0], 'downwards type is expected: ' + et[0]);
      t.equals(typeof data, et[1], 'downwards data type is expected: ' + et[1]);
      if (type === 0) {
        ask = data;
        return ask(1);
      }
      if (type === 1) {
        const e = downwardsExpected.shift();
        t.equals(data, e, 'downwards data is expected: ' + e);
        return ask(1);
      }
    };
  }

  dropRepeats()(makeSource())(0, makeSink());

  setTimeout(() => {
    t.pass('Nothing else happens');
    t.end();
  }, 300);
});


test('it drops consecutive repeated values from a pullable source with a predicate function', function (t) {
  t.plan(26);
  const upwardsExpected = [
    [0, TYPES.FUNCTION],
    [1, TYPES.UNDEFINED],
    [1, TYPES.UNDEFINED],
    [1, TYPES.UNDEFINED],
    [1, TYPES.UNDEFINED]
  ];
  const downwardsExpectedType = [
    [0, TYPES.FUNCTION],
    [1, TYPES.OBJECT],
    [1, TYPES.OBJECT],
    [2, TYPES.UNDEFINED]
  ];
  const A = { name: 'A' };
  const B = { name: 'B' };
  const downwardsExpected = [A, B];

  function makeSource() {
    let sink;
    let sent = 0;
    return function source(type, data) {
      t.true(upwardsExpected.length > 0, 'source can be pulled');
      const e = upwardsExpected.shift();
      t.equals(type, e[0], 'upwards type is expected: ' + e[0]);
      t.equals(typeof data, e[1], 'upwards data is expected: ' + e[1]);

      if (type === 0) {
        sink = data;
        sink(0, source);
        return;
      }
      if (sent === 3) {
        sink(2);
        return;
      }
      if (sent === 0) {
        sent++;
        sink(1, A);
        return;
      }
      if (sent === 1) {
        sent++;
        sink(1, A);
        return;
      }
      if (sent === 2) {
        sent++;
        sink(1, B);
        return;
      }
    };
  }

  function makeSink() {
    let ask;
    return (type, data) => {
      const et = downwardsExpectedType.shift();
      t.equals(type, et[0], 'downwards type is expected: ' + et[0]);
      t.equals(typeof data, et[1], 'downwards data type is expected: ' + et[1]);
      if (type === 0) {
        ask = data;
        return ask(1);
      }
      if (type === 1) {
        const e = downwardsExpected.shift();
        t.equals(data, e, 'downwards data is expected: ' + e);
        return ask(1);
      }
    };
  }

  dropRepeats((a, b) => a.name === b.name)(makeSource())(0, makeSink());

  setTimeout(() => {
    t.pass('Nothing else happens');
    t.end();
  }, 300);
});
// FROM HERE
test('it drops consecutive repeated values from an async listenable source', function (t) {
  t.plan(15);
  const upwardsExpected = [
    [0, TYPES.FUNCTION],
    [1, TYPES.UNDEFINED]
  ];
  const downwardsExpectedType = [
    [0, TYPES.FUNCTION],
    [1, TYPES.NUMBER],
    [1, TYPES.NUMBER],
    [2, TYPES.UNDEFINED]
  ];
  const downwardsExpected = [1, 2];

  function makeSource() {
    let sent = 0;
    return function source(type, data) {
      const e = upwardsExpected.shift();
      t.equals(type, e[0], 'upwards type is expected: ' + e[0]);
      t.equals(typeof data, e[1], 'upwards data is expected: ' + e[1]);
      if (type === 0) {
        const sink = data;
        const id = setInterval(() => {
          if (sent === 0) {
            sent++;
            return sink(1, 1);
          }
          if (sent === 1) {
            sent++;
            return sink(1, 1);
          }
          if (sent === 2) {
            sent++;
            return sink(1, 2);
          }
          if (sent === 3) {
            sink(2);
            clearInterval(id);
            return;
          }
        }, 50);
        sink(0, source);
      }
    };
  }

  function makeSink() {
    return (type, data) => {
      const et = downwardsExpectedType.shift();
      t.equals(type, et[0], 'downwards type is expected: ' + et[0]);
      t.equals(typeof data, et[1], 'downwards data type is expected: ' + et[1]);
      if (type === 1) {
        const e = downwardsExpected.shift();
        t.equals(data, e, 'downwards data is expected: ' + e);
      }
    };
  }

  dropRepeats()(makeSource())(0, makeSink());

  setTimeout(() => {
    t.pass('Nothing else happens');
    t.end();
  }, 250);
});
// TILL HERE
test('it returns a source that disposes upon upwards END (2)', function (t) {
  t.plan(14);
  const upwardsExpected = [
    [0, TYPES.FUNCTION],
    [1, TYPES.UNDEFINED],
    [1, TYPES.UNDEFINED],
    [2, TYPES.UNDEFINED]
  ];
  const downwardsExpectedType = [
    [0, TYPES.FUNCTION],
    [1, TYPES.STRING]
  ];
  const downwardsExpected = ['a'];

  function makeSource() {
    let id;
    return function source(type, data) {
      const e = upwardsExpected.shift();
      t.equals(type, e[0], 'upwards type is expected: ' + e[0]);
      t.equals(typeof data, e[1], 'upwards data is expected: ' + e[1]);
      if (type === 0) {
        const sink = data;
        id = setInterval(() => sink(1, 'a'), 50);
        sink(0, source);
      } else if (type === 2) {
        clearInterval(id);
      }
    };
  }

  function makeSink(type, data) {
    let ask;
    const e = downwardsExpected.shift();

    return function (type, data) {
      const et = downwardsExpectedType.shift();
      t.equals(type, et[0], 'downwards type is expected: ' + et[0]);
      t.equals(typeof data, et[1], 'downwards data type is expected: ' + et[1]);
      if (type === 0) {
        ask = data;
      }
      if (type === 1) {
        t.equals(data, e, 'downwards data is expected: ' + e);
        return;
      }
      setTimeout(() => ask(2), 200);
    };
  }

  dropRepeats()(makeSource())(0, makeSink());

  setTimeout(() => {
    t.pass('Nothing else happens');
    t.end();
  }, 700);
});