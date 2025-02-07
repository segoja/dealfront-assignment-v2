import { setupTest } from 'repo-viewer/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Serializer | branch', function (hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const store = this.owner.lookup('service:store');
    const serializer = store.serializerFor('branch');

    assert.ok(serializer, 'serializer exists');
  });

  test('it serializes records', function (assert) {
    const store = this.owner.lookup('service:store');
    const record = store.createRecord('branch', {});

    const serializedRecord = record.serialize();

    assert.ok(serializedRecord, 'it serializes records');
  });
});
