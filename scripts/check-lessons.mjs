// Checks lesson structure and that every original section of each chapter is covered by exactly one lesson.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parse } from 'yaml';
import { extractHeadings, norm } from './lib/source-headings.mjs';

const BOOK_URL = 'https://github.com/bojieli/ai-agent-book/blob/main/book-en/';
const CHAPTERS = [
	{ dir: 'src/content/docs/chapter-1', source: 'source/book-en/chapter1.md', expected: 8 },
	{ dir: 'src/content/docs/chapter-2', source: 'source/book-en/chapter2.md', expected: 10 },
];

const errors = [];
let total = 0;

for (const chapter of CHAPTERS) {
	const sourceName = basename(chapter.source);
	const SOURCE_URL_PREFIX = `${BOOK_URL}${sourceName}#`;
	const sourceHeadings = extractHeadings(readFileSync(chapter.source, 'utf8'));
	const claimed = new Map();
	const files = existsSync(chapter.dir)
		? readdirSync(chapter.dir)
				.filter((f) => /^\d{2}-.*\.mdx$/.test(f))
				.sort()
		: [];
	total += files.length;

	for (const file of files) {
		const err = (msg) => errors.push(`${basename(chapter.dir)}/${file}: ${msg}`);
		const text = readFileSync(join(chapter.dir, file), 'utf8');
		const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
		if (!match) {
			err('missing frontmatter');
			continue;
		}
		const fm = parse(match[1]) ?? {};
		const body = match[2];

		if (!fm.title) err('frontmatter.title is required');
		if (!fm.description) err('frontmatter.description is required');
		if (typeof fm.sidebar?.order !== 'number') err('frontmatter.sidebar.order must be a number');
		if (!fm.source?.url?.startsWith(SOURCE_URL_PREFIX)) err(`frontmatter.source.url must start with ${SOURCE_URL_PREFIX}`);

		const sections = (fm.source?.sections ?? []).map(norm);
		if (sections.length === 0) err('frontmatter.source.sections must list the original headings this lesson covers');
		for (const s of sections) {
			if (!sourceHeadings.includes(s)) err(`source section not found in ${sourceName}: "${s}"`);
			if (claimed.has(s)) err(`section "${s}" is already covered by ${claimed.get(s)}`);
			else claimed.set(s, file);
		}

		const firstH2 = body.search(/^## /m);
		const tldr = body.indexOf(':::tip[TL;DR]');
		if (tldr === -1 || (firstH2 !== -1 && tldr > firstH2)) err('must open with a :::tip[TL;DR] block before the first ## heading');
		if (!body.includes('<Figure')) err('must include at least one <Figure>');
		const keyTakeaways = body.indexOf('<KeyTakeaways>');
		if (keyTakeaways === -1) err('must include <KeyTakeaways>');
		const references = body.indexOf('### References');
		const check = body.indexOf('## Check yourself');
		if (check === -1) err('must include a "## Check yourself" section');
		else {
			const quizCount = (body.slice(check).match(/<Quiz /g) ?? []).length;
			if (quizCount < 2 || quizCount > 4) err('"## Check yourself" needs 2-4 <Quiz> items');
			if (keyTakeaways !== -1 && keyTakeaways > check) err('<KeyTakeaways> must come before "## Check yourself"');
			if (references !== -1 && references > check) err('"### References" must come before "## Check yourself"');
		}
		if (references !== -1 && keyTakeaways !== -1 && references < keyTakeaways) err('"### References" must come after <KeyTakeaways>');
		const bodyWithoutCodeFences = body.replace(/```[\s\S]*?```/g, '');
		if (/\b(TODO|TBD|lorem ipsum)\b/i.test(bodyWithoutCodeFences)) err('contains placeholder text');
	}

	const uncovered = sourceHeadings.filter((h) => !claimed.has(h));
	if (files.length === chapter.expected) {
		for (const h of uncovered) errors.push(`${sourceName}: original section not covered by any lesson: "${h}"`);
	} else if (uncovered.length) {
		console.warn(`${sourceName}: ${files.length}/${chapter.expected} lessons present; ${uncovered.length} original sections not yet covered.`);
	}
}

if (errors.length) {
	console.error(errors.map((e) => `✗ ${e}`).join('\n'));
	process.exit(1);
}
console.log(`✓ ${total} lesson(s) pass structure checks`);
