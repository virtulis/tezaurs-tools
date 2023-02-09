export interface Entry {
	id: string;
	sortKey: string;
	n: number;
	type: TypeValues['entry'];
	forms: Form[];
	senses: Sense[];
	etymology?: Etymology;
	properties: Properties;
}

export interface Form {
	type: TypeValues['form'];
	lemma?: string;
	headword?: string;
	properties: Properties;
	pronounciation?: string[];
}

export interface Sense {
	id: string;
	n: number;
	properties: Properties;
	children?: Sense[];
	definition?: string;
	mentioned?: string[];
	references?: Reference[];
}

export interface Etymology {
	definition: string;
	mentioned?: string[];
}

export interface Reference {
	id?: string;
	type: TypeValues['xr'];
	references: string[];
}

export type Properties = Record<TypeValues['gram'] | TypeValues['gramgrp'] | 'iType' | string, string>;

export interface TypeValues {
	entry: 'abbr' | 'main' | 'foreign' | 'mwe' | 'affix' | string;
	form: 'lemma' | 'headword' | 'derivative' | 'variant' | 'simple' | 'variantDerivative' | 'other' | 'abbreviation' | 'phrase' | string;
	orth: 'lemma' | string;
	itype: 'https://github.com/PeterisP/morphology' | string;
	gramgrp: 'properties' | 'Vispārīgais lietojuma biežums' | 'Formā/atvasinājumā' | 'restrictionConjunction' | 'restrictionDisjunction' | 'Kopā ar' | 'Teikumos / noteikta veida struktūrās' | 'Vārddarināšana (sastāvdaļa)' | 'Vārddarināšana (rezultāts)' | string;
	gram: 'Lietojums' | 'Joma' | 'Vārdšķira' | 'Lietvārda tips' | 'Valoda' | 'Īpašvārda veids' | 'Dzimte' | 'Morfotabulas attēlošana' | 'Skaitlis' | 'Stils' | 'Locījums' | 'Leksēmas pamatformas īpatnības' | 'Noteiktība' | 'Konversija' | 'Transitivitāte' | 'Persona' | 'Pamatforma morforīkiem' | 'Divdabja veids' | 'Izteiksme' | 'Pakāpe' | 'Lielo/mazo burtu lietojums' | 'Dialekta iezīmes' | 'Hipotēze' | 'Sintaktisks ierobežojums' | 'languageMaterial' | 'Locīšanas īpatnības' | 'Pabeigtība' | 'Priedēklis' | 'Konjugācija' | 'Laiks' | 'Gramatiku analīzes problēmas' | 'Vietniekvārda tips' | 'Nelokāms vārds' | 'Noliegums' | 'Skaitļa vārda tips' | 'Pronunciations' | 'Priedēkļa piemitība' | 'Saikļa semantiskais tips' | 'Saikļa sintaktiskā funkcija' | 'Salikta saikļa daļa' | 'Teikuma komunikatīvais tips' | 'Skaitļa īpatnības' | 'Rakstība' | 'Deminutīvs' | 'Semantisks frāzes raksturojums' | 'Izloksne' | 'Izlokšņu grupa' | 'Novietojums' | 'Saīsinājuma tips' | 'Šablons salikteņa vairākpunktu locīšanai' | 'Kārta' | 'Kategorija (vārda daļai)' | 'Kategorija' | string;
	xr: 'synset' | 'hypernym' | 'hyponym' | 'holonym' | 'meronym' | 'similar' | 'also' | 'antonym' | 'gradation_set' | 'gradation_class' | string;
}
