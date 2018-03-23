const dropRepeats = pred => src => (start, sink) => {
  const INIT = {};
  let cache = INIT;
  let ask;
  const equals = pred || ((a, b) => a === b);
  start === 0 && src(start, (t, d) => {
    if (t === start) ask = d;
    if (t === 1) return cache !== INIT && equals(cache, d) ? ask(t) : sink(t, cache = d);
    sink(t, d);
  });
};

module.exports = dropRepeats;