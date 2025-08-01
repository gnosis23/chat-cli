import { expect, describe, it, beforeEach } from 'vitest';
import marked, { resetMarked } from '../src/lib/marked';

describe('Markdown', () => {
	beforeEach(() => {
		resetMarked();
	});

	it('should render del', () => {
		expect(marked('~~del~~').trim()).toEqual('del');
	});
});
