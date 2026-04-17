'use strict';

/**
 * Runs multiple asynchronous operations in parallel with a concurrency limit.
 * This function takes an iterable of items, an asynchronous iterator function, and a concurrency
 * limit. It processes the items in the iterable using the iterator function, ensuring that no more
 * than the specified number of operations are running concurrently. Once all operations are
 * complete, it returns an array of results.
 *
 * @param iterable
 * @param iteratorFn
 * @param limit
 * @returns {Promise<Awaited<unknown>[]>}
 */
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
