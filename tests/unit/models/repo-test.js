import { module, test } from 'qunit';
import { setupTest } from 'repo-viewer/tests/helpers';

module('Unit | Model | repo', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('repo', {});

    assert.ok(model);
  });

  test('it has correct attributes', function (assert) {
    let store = this.owner.lookup('service:store');
    let model = store.createRecord('repo', {
      name: 'Test Repo',
      owner: 'test-user',
      description: 'A test repository',
      url: 'https://github.com/test-user/test-repo',
      language: 'JavaScript',
      private: false,
      branchesUrl: 'https://api.github.com/repos/test-user/test-repo/branches',
    });

    assert.strictEqual(model.name, 'Test Repo');
    assert.strictEqual(model.owner, 'test-user');
    assert.strictEqual(model.description, 'A test repository');
    assert.strictEqual(model.url, 'https://github.com/test-user/test-repo');
    assert.strictEqual(model.language, 'JavaScript');
    assert.false(model.private);
    assert.strictEqual(
      model.branchesUrl,
      'https://api.github.com/repos/test-user/test-repo/branches',
    );
  });

  test('it has a hasMany relationship with branches', function (assert) {
    const Repo = this.owner.lookup('service:store').modelFor('repo');
    const relationships = Repo.relationshipsByName;

    assert.ok(
      relationships.has('branches'),
      'Repo has a hasMany relationship with branches',
    );
    assert.strictEqual(relationships.get('branches').kind, 'hasMany');
  });
});
