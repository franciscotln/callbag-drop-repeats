# callbag-drop-repeats

Drops consecutive duplicate values. Works on either pullable or listenable sources.
Takes an optional custom predicate function.
If not provided then `(a, b) => a === b` will be used.

`npm install callbag-drop-repeats`

## Examples

### Listenables

```js
const dropRepeats = require('callbag-drop-repeats');
const { forEach, map, interval, pipe, take } = require('callbag-basics');

pipe(
  interval(1000),
  take(3),
  map(() => 'Always me, but once'),
  dropRepeats(),
  forEach((x) => {
    console.log(x); // 'Always me, but once'
  })
);
```

### Pullables

Without a predicate function:

```js
const dropRepeats = require('callbag-drop-repeats');
const { forEach, fromIter, pipe } = require('callbag-basics');

pipe(
  fromIter([0, 0, 0, 1]),
  dropRepeats(),
  forEach((x) => {
    console.log(x); // 0
  })                // 1
);
```

With a predicate function:

```js
const dropRepeats = require('callbag-drop-repeats');
const { forEach, fromIter, pipe } = require('callbag-basics');

pipe(
  fromIter([{ name: 'A' }, { name: 'A' }, { name: 'B' }]),
  dropRepeats((prev, curr) => prev.name === curr.name),
  forEach((x) => {
    console.log(x); // { name: 'A' }
  })                // { name: 'B' } 
);
```