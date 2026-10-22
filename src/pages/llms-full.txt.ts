import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

const SITE = 'https://docs.airbuild.dev';

const SECTION_ORDER = ['getting-started', 'guides', 'developer', 'resources'];

function sortedDocs(docs: Awaited<ReturnType<typeof getCollection<'docs'>>>) {
	const rank = (id: string) => {
		const section = id.split('/')[0];
		const i = SECTION_ORDER.indexOf(section);
		return i === -1 ? SECTION_ORDER.length : i;
	};
	return [...docs].sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id));
}

export const GET: APIRoute = async () => {
	const docs = sortedDocs(await getCollection('docs'));

	const parts = [
		'# AirBuild Docs (full)',
		'',
		'Every AirBuild documentation page concatenated for LLM context.',
		`Source pages live under ${SITE}/.`,
		'',
	];

	for (const doc of docs) {
		parts.push(
			'---',
			'',
			`## ${doc.data.title}`,
			`URL: ${SITE}/${doc.id}/`,
			'',
			(doc.body ?? '').trim(),
			'',
		);
	}

	return new Response(parts.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
