import { createFromRoot } from 'codama';
import { rootNodeFromAnchor } from '@codama/nodes-from-anchor';
import anchorIdl from './anchor_project/target/idl/twitter.json';

import * as fs from 'fs';

const codama = createFromRoot(rootNodeFromAnchor(anchorIdl));
console.log(codama);

fs.writeFileSync("./codamaIDL.json", codama.getJson());