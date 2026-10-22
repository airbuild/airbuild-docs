import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

const SITE = 'https://docs.airbuild.dev';

// Sidebar order — llms.txt reads better grouped like the navigation.
const SECTION_ORDER = ['getting-started', 'guides', 'developer', 'resources'];
const SECTION_LABELS: Record<string, string> = {
	'getting-started': 'Getting Started',
	guides: 'Guides',
	developer: 'Developer',
	resources: 'Resources',
};

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

	const sections = new Map<string, string[]>();
	for (const doc of docs) {
		const section = doc.id.split('/')[0];
		const label = SECTION_LABELS[section] ?? 'Other';
		const url = `${SITE}/${doc.id}/`;
		const desc = doc.data.description ? ` — ${doc.data.description}` : '';
		const lines = sections.get(label) ?? [];
		lines.push(`- [${doc.data.title}](${url})${desc}`);
		sections.set(label, lines);
	}

	const parts = [
		'# AirBuild Docs',
		'',
		'> AirBuild is an OTA app distribution platform for iOS and Android — upload builds,',
		'> share install links and QR codes, manage testers, and push CodePush OTA updates',
		'> for Flutter and React Native.',
		'',
		'Use this index to find the right page, then fetch the page URL as markdown.',
		'The complete docs concatenated into one file are available at:',
		`  ${SITE}/llms-full.txt`,
		'',
		'Key resources for AI agents and tooling:',
		'- OpenAPI spec: https://airbuild.dev/api/openapi',
		'- AI assistant integration guide: ' + `${SITE}/developer/ai-agents/`,
		'- CLI reference: ' + `${SITE}/developer/cli/`,
		'- REST API reference: ' + `${SITE}/developer/api-reference/`,
		'',
	];
	for (const [label, lines] of sections) {
		parts.push(`## ${label}`, '', ...lines, '');
	}

	return new Response(parts.join('\n'), {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
