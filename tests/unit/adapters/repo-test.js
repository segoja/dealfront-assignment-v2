import { setupTest } from 'repo-viewer/tests/helpers';
import { module, test } from 'qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Adapter | repo', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it correctly fetches repository data from GitHub API', async function (assert) {
    this.server.get('https://api.github.com/orgs/:org/repos', () => {
      return [
        { id: '1', name: 'test-repo', owner: { login: 'test-user' } },
        { id: '2', name: 'another-repo', owner: { login: 'another-user' } },
      ];
    });

    let store = this.owner.lookup('service:store');
    let adapter = this.owner.lookup('adapter:repo');

    let response = await adapter.query(store, null, {
      org: 'test-org',
      token: 'fake-token',
      page: 1,
      perPage: 30,
    });

    assert.ok(response.data, 'Response contains data');
    assert.strictEqual(
      response.data.length,
      2,
      'Correct number of repos returned',
    );
    assert.strictEqual(
      response.data[0].name,
      'test-repo',
      'Returned repo name is correct',
    );
  });
});
