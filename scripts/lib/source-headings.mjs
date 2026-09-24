// Heading extraction for source chapters: ##–#### headings, skipping fenced code (including fences inside blockquotes).
export const norm = (s) =>
	s
		.replace(/[‘’]/g, "'")
		.replace(/[“”]/g, '"')
		.trim();

const FENCE = /^(>\s*)?```/;

export function extractHeadings(markdown) {
	const headings = [];
	let inFence = false;
	for (const line of markdown.split('\n')) {
		if (FENCE.test(line)) {
			inFence = !inFence;
			continue;
		}
		if (!inFence && /^#{2,4} /.test(line)) headings.push(norm(line.replace(/^#+ /, '')));
	}
	return headings;
}
