// import { createCodamaConfig } from 'gill'

// export default createCodamaConfig({
//   clientJs: 'src/client/js/generated',
//   idl: 'target/idl/twitter.json',
// })

import { createFromRoot } from 'codama';
import { rootNodeFromAnchor } from '@codama/nodes-from-anchor';
import anchorIdl from './target/idl/twitter.json';

const codama = createFromRoot(rootNodeFromAnchor(anchorIdl));
console.log(codama);