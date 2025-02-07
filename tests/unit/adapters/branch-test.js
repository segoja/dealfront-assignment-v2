import { setupTest } from 'repo-viewer/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Adapter | branch', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const adapter = this.owner.lookup('adapter:branch');
    assert.ok(adapter, 'adapter exists');
  });
});
