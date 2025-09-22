import { renderJavaScriptVisitor, renderRustVisitor } from '@codama/renderers';
import { createFromRoot } from 'codama';

import codamaIDL from './codamaIDL.json';

const codama = createFromRoot(codamaIDL);
console.log(codama);

codama.accept(renderJavaScriptVisitor('./anchor_project/src/clients/js/src/generated', { }));
codama.accept(renderRustVisitor('./anchor_project/src/clients/rust/src/generated', { }));