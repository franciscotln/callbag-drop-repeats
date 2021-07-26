import { Source } from 'callbag'

export default function dropRepeats<I>(
  previcate?: (v: I) => boolean,
): (source: Source<I>) => Source<I>
