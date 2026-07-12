'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  OperationState,
  inferLatestOperationState,
} = require('../src/operationState');

const LOCK_TYPES = [10, 11];
const UNLOCK_TYPES = [20, 21];

test('selects the newest explicit operation regardless of array order', () => {
  const operations = [
    { recordType: 10, operateDate: '20260711230000', recordNumber: 41 },
    { recordType: 20, operateDate: '20260711225500', recordNumber: 40 },
  ];

  assert.equal(
    inferLatestOperationState(operations.reverse(), LOCK_TYPES, UNLOCK_TYPES),
    OperationState.LOCKED,
  );
});

test('uses record number and then array order when timestamps are unavailable', () => {
  assert.equal(
    inferLatestOperationState([
      { recordType: 10, recordNumber: 7 },
      { recordType: 20, recordNumber: 8 },
    ], LOCK_TYPES, UNLOCK_TYPES),
    OperationState.UNLOCKED,
  );

  assert.equal(
    inferLatestOperationState([
      { recordType: 20 },
      { recordType: 10 },
    ], LOCK_TYPES, UNLOCK_TYPES),
    OperationState.LOCKED,
  );
});

test('ignores unrelated operations and preserves unknown when no state evidence exists', () => {
  assert.equal(
    inferLatestOperationState([
      { recordType: 99, operateDate: '20260711230000' },
      null,
    ], LOCK_TYPES, UNLOCK_TYPES),
    undefined,
  );
});

test('manual operation-log refresh routes raw records through state reconciliation', () => {
  const managerSource = fs.readFileSync(path.join(__dirname, '../src/manager.js'), 'utf8');

  assert.match(
    managerSource,
    /const rawOperations = await lock\.getOperationLog\(true, reload\);\s+await this\._applyOperationState\(lock, rawOperations\);/,
  );
});

test('repeated log confirmation does not emit a duplicate state event', () => {
  const managerSource = fs.readFileSync(path.join(__dirname, '../src/manager.js'), 'utf8');

  assert.match(
    managerSource,
    /if \(previousStatus === confirmedStatus\) \{[\s\S]*?return confirmedStatus;\s+\}/,
  );
});

test('initial discovery honors the proactive log-fetch setting', () => {
  const managerSource = fs.readFileSync(path.join(__dirname, '../src/manager.js'), 'utf8');

  assert.match(
    managerSource,
    /Successful connect attempt to paired lock[\s\S]*?hasProactiveLogFetching\(\)[\s\S]*?if \(proactiveLogsEnabled\) \{\s+await this\._processOperationLog\(lock\);/,
  );
});
