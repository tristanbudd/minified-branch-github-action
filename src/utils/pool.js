'use strict';

const asyncPool = async (iterable, iteratorFn, limit = 10) => {
  const results = [];
  const executing = new Set();

  for (const item of iterable) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    results.push(p);
    executing.add(p);

    const clean = () => executing.delete(p);
    p.then(clean).catch(clean);

    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
};

module.exports = { asyncPool };
