import path from 'path';
import { fileURLToPath } from 'url';
import * as process from 'process';
import { createReadStream, createWriteStream } from 'fs';
import sax, { Tag } from 'sax';
import { Entry, Etymology, Form, Properties, Reference, Sense } from './types.js';
import { writeFile } from 'fs/promises';
import * as os from 'os';

const root = path.join(fileURLToPath(import.meta.url), '../..');
const src = process.argv[2] ?? path.join(root, 'data/tezaurs_2022_04_tei.xml');
const dest = process.argv[3] ?? path.join(root, 'data/tezaurs.json');
const saxStream = sax.createStream(false, { xmlns: false, lowercase: true });

const ndjson = createWriteStream(dest.replace(/\.\w+$/, '.ndjson'));

// const curPath: Tag[] = [];
// const curTag = () => curPath[curPath.length - 1];

const current: {
	tag: Tag[];
	entry: Entry[];
	form: Form[];
	sense: Sense[];
	properties: Properties[];
	etym: Etymology[];
	xr: Reference[];
} = {
	tag: [],
	entry: [],
	form: [],
	sense: [],
	properties: [],
	etym: [],
	xr: [],
};
type Current = typeof current;
type Kind = keyof Current;
type Thing<K extends Kind> = Current[K][number];

const entries: Entry[] = [];

const typesSeen = new Map<string, Set<string>>;
const tagsSeen = new Map<string, {
	within: Set<string | null>;
	attrs: Set<string>;
	children: Map<string, number>;
}>;
const seenInThisTag = new Map<string, Map<string, number>>();

const cur = <K extends Kind>(kind: K) => {
	return current[kind][0] as Thing<K> | undefined;
};
const ensureCur = <K extends Kind>(kind: K): Thing<K> => {
	const it = cur(kind);
	if (!it) throw new Error(`Missing expected ${kind}, in ${cur('tag')?.name} at ${saxStream._parser.line}`);
	return it;
};
const pop = <K extends Kind>(kind: K): Thing<K> => {
	const it = current[kind].shift();
	if (!it) throw new Error(`Missing expected ${kind}, in ${cur('tag')?.name} at ${saxStream._parser.line}`);
	return it;
};
const push = <K extends Kind>(kind: K, it: Thing<K>) => {
	current[kind].unshift(it as any);
	return it;
};
const pushFirst = <K extends Kind>(kind: K, it: Thing<K>) => {
	if (current[kind].length) throw new Error(`Found unexpected ${kind}, in ${cur('tag')?.name}, at ${saxStream._parser.line}`);
	return push(kind, it);
};

const shortenId = (id: string) => id.replace(/tezaurs\w+\//, '');
const defTarget = () => {
	const it = cur('sense') ?? cur('etym');
	if (it === null || it === undefined) throw new Error(`No definition target, in ${cur('tag')?.name} at ${saxStream._parser.line}`);
	return it!;
};
const appendDef = (text: string) => {
	const sense = defTarget();
	sense.definition = (sense.definition ? sense.definition + ' ' : '') + text;
};

let onText: ((text: string) => void) | null = null;

const ignoreTags = new Set(['tei', 'teiheader', 'body']);
saxStream.on('opentag', function (tag: Tag) {
	
	const cSeen = seenInThisTag.get(`${cur('tag')?.name}:${current.tag.length}`);
	
	if (!tagsSeen.has(tag.name)) tagsSeen.set(tag.name, { within: new Set(), attrs: new Set(), children: new Map() });
	const seen = tagsSeen.get(tag.name)!;
	seen.within.add(cur('tag')?.name ?? 'root');
	if (cSeen) {
		cSeen.set(tag.name, (cSeen.get(tag.name) ?? 0) + 1);
		const cMap = tagsSeen.get(ensureCur('tag').name)!.children;
		// if (tag.name != 'entry' && cSeen.get(tag.name)! > (cMap.get(tag.name) ?? 0)) console.log(saxStream._parser.line, curPath.map(t => t.name), tag.name, cSeen.get(tag.name));
		cMap.set(tag.name, Math.max(cMap.get(tag.name) ?? 0, cSeen.get(tag.name)!));
	}
	const attrs = tag.attributes;
	for (const key in attrs) seen.attrs.add(key);
	
	// if (
	// 	cur('tag')?.name == tag.name
	// 	&& tag.name == 'form' && attrs.type != 'headword'
	// ) {
	// 	console.log(saxStream._parser.line, curPath.map(t => t.name), tag.name);
	// }
	
	push('tag', tag);
	seenInThisTag.set(`${cur('tag')?.name}:${current.tag.length}`, new Map());
	
	if (ignoreTags.has(tag.name)) {
		onText = () => { /* noop */ };
		return;
	}
	
	if (attrs.type) {
		if (!typesSeen.has(tag.name)) typesSeen.set(tag.name, new Set());
		typesSeen.get(tag.name)!.add(attrs.type);
	}
	
	if (tag.name == 'entry') {
		pushFirst('entry', {
			id: shortenId(attrs.id),
			type: attrs.type,
			sortKey: attrs.sortkey,
			n: parseInt(attrs.n),
			forms: [],
			senses: [],
			properties: push('properties', {}),
		});
		return;
	}
	
	if (tag.name == 'form') {
		const parent = cur('form');
		push('form', {
			type: attrs.type,
			properties: push('properties', {}),
		});
		if (parent && attrs.type == 'headword') onText = text => parent.headword = text;
	}
	
	if (tag.name == 'sense') {
		push('sense', {
			id: shortenId(attrs.id),
			n: parseInt(attrs.n),
			properties: push('properties', {}),
		});
	}
	if (tag.name == 'etym') {
		push('etym', {
			definition: '',
		});
		onText = appendDef;
	}
	
	if (tag.name == 'gram') {
		onText = text => ensureCur('properties').iType = text;
	}
	if (tag.name == 'itype') {
		onText = text => ensureCur('properties').iType = text;
	}
	if (tag.name == 'orth' && attrs.type == 'lemma') { // other not expected
		onText = text => ensureCur('form').lemma = text;
	}
	if (tag.name == 'def') {
		onText = appendDef;
	}
	if (tag.name == 'mentioned') {
		onText = text => {
			appendDef(text);
			(defTarget().mentioned ||= []).push(text);
		};
	}
	if (tag.name == 'pron') {
		onText = text => (ensureCur('form').pronounciation ??= []).push(text);
	}
	if (tag.name == 'xr') {
		pushFirst('xr', { id: attrs.id && shortenId(attrs.id), type: attrs.type, references: [] });
	}
	if (tag.name == 'ref') {
		onText = text => ensureCur('xr').references.push(shortenId(text));
	}
	
});

saxStream.on('text', text => {
	const trimmed = text.trim();
	if (!trimmed.length) return;
	if (!onText) throw new Error(`Unexpected text, in ${cur('tag')?.name} at ${saxStream._parser.line}`);
	onText(trimmed);
});

saxStream.on('closetag', tagName => {

	pop('tag');
	onText = null;

	if (tagName == 'entry') {
		const it = pop('entry');
		entries.push(it);
		pop('properties');
		ndjson.write(JSON.stringify(it) + os.EOL);
	}
	
	if (tagName == 'form') {
		const it = pop('form');
		const parent = cur('form');
		if (!parent) ensureCur('entry').forms.push(it); // else it was the weird "headword" "form"
		pop('properties');
	}
	if (tagName == 'sense') {
		const it = pop('sense');
		const parent = cur('sense');
		if (parent) (parent.children ??= []).push(it);
		else ensureCur('entry').senses.push(it);
		pop('properties');
	}
	if (tagName == 'etym') {
		ensureCur('entry').etymology = pop('etym');
	}
	if (tagName == 'xr') {
		(ensureCur('sense').references ??= []).push(pop('xr'));
	}
	
	if (tagName == 'mentioned') {
		onText = appendDef; // continue
	}
	
});

await new Promise(resolve => createReadStream(src).pipe(saxStream).on('end', resolve));
await new Promise(resolve => ndjson.close(resolve));

await writeFile(dest, JSON.stringify(entries, null, '\t'));

console.log(typesSeen);

for (const [key, set] of typesSeen) {
	console.log(`${key}: ${[...set.values()].map(v => `'${v}'`).join(' | ')} | string;`);
}

console.log(seenInThisTag);
console.log(tagsSeen);
