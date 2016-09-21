const assert = require('assert');
const build = require('../');

describe('build', () => {
	it('should run without error', () => {
		assert.ok(build(), 'build ran successfully');
	});
});
