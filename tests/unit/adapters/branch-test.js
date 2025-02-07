import { setupTest } from 'repo-viewer/tests/helpers';
import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Adapter | branch', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it correctly fetches branch data from GitHub API', async function (assert) {
    this.server.get(
      'https://api.github.com/repos/:owner/:repo/branches',
      () => {
        return [
          { name: 'main', protected: true },
          { name: 'develop', protected: false },
        ];
      },
    );

    let store = this.owner.lookup('service:store');
    let adapter = this.owner.lookup('adapter:branch');

    let response = await adapter.query(store, null, {
      repoId: '1',
      repoName: 'test-repo',
      org: 'test-org',
      token: 'fake-token',
      page: 1,
      perPage: 10,
    });

    assert.ok(response.data, 'Response contains data');
    assert.strictEqual(
      response.data.length,
      2,
      'Correct number of branches returned',
    );
    assert.strictEqual(
      response.data[0].attributes.name,
      'main',
      'Returned branch name is correct',
    );
  });
});
