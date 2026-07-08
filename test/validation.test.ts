import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAmount, parseOrderType, parseLimit, MAX_LIMIT, MAX_AMOUNT_CENTS } from '../src/lib/validation.js';
import { BadRequestError } from '../src/lib/errors.js';

test('parseAmount: accepts positive integers, rejects everything else', () => {
  assert.equal(parseAmount(1), 1);
  assert.equal(parseAmount(MAX_AMOUNT_CENTS), MAX_AMOUNT_CENTS);
  const badVectors = [0, -5, 3.5, MAX_AMOUNT_CENTS + 1, '100', null, undefined, NaN, Infinity];
  for (const bad of badVectors) {
    assert.throws(() => parseAmount(bad as unknown), BadRequestError, `should reject ${String(bad)}`);
  }
});

test('parseOrderType: defaults to sale, rejects unknown values', () => {
  assert.equal(parseOrderType(undefined), 'sale');
  assert.equal(parseOrderType('sale'), 'sale');
  assert.equal(parseOrderType('refund'), 'refund');
  for (const bad of ['gift', 'SALE', '', 1, null]) {
    assert.throws(() => parseOrderType(bad as unknown), BadRequestError, `should reject ${String(bad)}`);
  }
});

test('parseLimit: default when absent, fails fast on invalid or over-cap (no silent clamp)', () => {
  assert.equal(parseLimit(undefined, 5), 5);
  assert.equal(parseLimit('10', 5), 10);
  assert.equal(parseLimit(String(MAX_LIMIT), 5), MAX_LIMIT);
  const badVectors = ['abc', '', '0', '-1', '10.5', String(MAX_LIMIT + 1), 'NaN'];
  for (const bad of badVectors) {
    assert.throws(() => parseLimit(bad, 5), BadRequestError, `should reject ${bad}`);
  }
});
