import { module, test } from 'qunit';
import { setupTest } from 'repo-viewer/tests/helpers';

module('Unit | Model | branch', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('branch', {});

    assert.ok(model);
  });

  test('it has correct attributes', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('branch', {
      name: 'main',
      protected: true,
    });

    assert.strictEqual(model.name, 'main');
    assert.true(model.protected);
  });

  test('it belongs to a repo', function (assert) {
    const Branch = this.owner.lookup('service:store').modelFor('branch');
    const relationships = Branch.relationshipsByName;

    assert.ok(
      relationships.has('repo'),
      'Branch has a belongsTo relationship with repo',
    );
    assert.strictEqual(relationships.get('repo').kind, 'belongsTo');
  });
});
