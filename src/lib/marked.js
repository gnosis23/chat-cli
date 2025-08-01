import { marked as m } from 'marked';
import { markedTerminal } from 'marked-terminal';

const marked = m;

resetMarked();

export default marked;

export function resetMarked() {
	marked.use(markedTerminal({}));
}
