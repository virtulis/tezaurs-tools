import { readFile } from 'fs/promises';
import { Entry } from './types.js';

const entries: Entry[] = await readFile('data/tezaurs.json', 'utf-8').then(JSON.parse);

const abbrs = entries.filter(it => ['abbr', 'mwe'].includes(it.type));
for (const entry of abbrs) {
	for (const form of entry.forms) {
		console.log(String(entry.id).padEnd(12), entry.type.padEnd(8), form.type.padEnd(12), form.lemma);
	}
}

// console.table(abbrs.flatMap(entry => entry.forms.map(f => [entry.id, entry.type, f.type, f.lemma?.slice(0, 100)])));

