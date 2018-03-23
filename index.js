const dropRepeats = pred => src => (start, sink) => {
  const INIT = {};
  let cache = INIT;
  let ask;
  const equals = pred || ((a, b) => a === b);
  start === 0 && src(start, (t, d) => {
    if (t === start) {
      ask = d;
    }
    if (t === 1) {
      let isEqual;
      try {
        isEqual = equals(cache, d) && cache !== INIT;
      } catch (e) {
        sink(2, e);
        return;
      }
      if (isEqual) {
        ask(t);
      } else {
        sink(t, d);
        cache = d;
      }
      return;
    }
    sink(t, d);
  });
};

module.exports = dropRepeats;