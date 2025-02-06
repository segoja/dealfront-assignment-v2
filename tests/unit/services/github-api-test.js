import { module, test } from 'qunit';
import { setupTest } from 'repo-viewer/tests/helpers';

module('Unit | Service | GithubApi', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:github-api');
    assert.ok(service);
  });
});
