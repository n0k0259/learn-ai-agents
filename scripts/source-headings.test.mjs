import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { extractHeadings, norm } from './lib/source-headings.mjs';

const fixture = readFileSync(new URL('./fixtures/fenced-headings.md', import.meta.url), 'utf8');

test('extracts ## to #### headings outside code fences', () => {
	assert.deepEqual(extractHeadings(fixture), ['Real Heading One', 'Real Heading Two', 'Real Heading "Three"']);
});

test('ignores headings inside plain and blockquoted fences', () => {
	const headings = extractHeadings(fixture);
	assert.ok(!headings.includes('Fake Inside Fence'));
	assert.ok(!headings.includes('Fake Inside Quoted Fence'));
});

test('norm straightens curly quotes', () => {
	assert.equal(norm(' Agent’s “x” '), `Agent's "x"`);
});

test('chapter2.md has exactly 41 real headings, none from fences', () => {
	const headings = extractHeadings(readFileSync('source/book-en/chapter2.md', 'utf8'));
	assert.equal(headings.length, 41);
	assert.ok(!headings.includes('File Operations'));
	assert.ok(!headings.includes('Network Requests'));
});
