import { setupTest } from 'repo-viewer/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Model | repo', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const model = store.createRecord('repo', {});
    assert.ok(model, 'model exists');
  });
});
