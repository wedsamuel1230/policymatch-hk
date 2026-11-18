import { schemes } from "./schemes";
import { buildPassages, createIndex } from "./rag-core";

export type { Hit, Passage } from "./rag-core";
export { tokenize } from "./rag-core";

/** The real corpus: eleven schemes, five passages each. Small enough to ship as
 *  part of the page, so the search runs on the visitor's machine. */
export const passages = buildPassages(schemes);
export const search = createIndex(passages);
