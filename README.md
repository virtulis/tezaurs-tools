# Tezaurs.lv as JSON

Converted from TEI/XML at https://repository.clarin.lv/repository/xmlui/handle/20.500.12574/66

## Of interest:

* `data/tezaurs.json` - converted data in JSON format (as a single JSON array)
* `data/tezaurs.ndjson` - individual entries (JSON object per line)
* `src/types.ts` - TypeScript definitions for the data
* `src/convert.ts` - conversion script, using a streaming parser for input (but still a ton of RAM for output)
* `src/example.ts` - usage example

## Building

* Requires Node.js v18 or later and PNPM
* After cloning the repo run `pnpm install`
* To recompile after changes run `pnpm watch`
* To run the example run `node out/example.js`

## Disclaimer

I have no idea what I'm doing (at least when it comes to linguistics).

This may or may not be useful for some other TEI/XML files. `convert.ts` has a bunch of logic and safeguards that can be adjusted to a different format.

The copyright status of the resulting data is left as an exercise to the reader. My code is MIT.
