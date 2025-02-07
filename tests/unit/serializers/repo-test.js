import { setupTest } from 'repo-viewer/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Serializer | repo', function (hooks) {
  setupTest(hooks);

  test('it correctly normalizes GitHub API data', function (assert) {
    let store = this.owner.lookup('service:store');
    let serializer = this.owner.lookup('serializer:repo');

    let rawPayload = {
      data: [
        {
          id: 1,
          name: 'test-repo',
          owner: { login: 'test-user' },
          description: 'A sample GitHub repository',
          html_url: 'https://github.com/test-user/test-repo',
          language: 'JavaScript',
          private: false,
          branches_url:
            'https://api.github.com/repos/test-user/test-repo/branches{/branch}',
        },
      ],
      meta: { totalPages: 1 },
    };

    let normalizedResponse = serializer.normalizeArrayResponse(
      store,
      null,
      rawPayload,
    );

    assert.ok(
      normalizedResponse.data,
      'Data array exists in normalized response',
    );
    assert.strictEqual(
      normalizedResponse.data.length,
      1,
      'Correct number of repos returned',
    );

    let repo = normalizedResponse.data[0];

    assert.strictEqual(repo.id, '1', 'ID is correctly converted to a string');
    assert.strictEqual(
      repo.attributes.name,
      'test-repo',
      'Repository name is correct',
    );
    assert.strictEqual(
      repo.attributes.owner,
      'test-user',
      'Owner login is correct',
    );
    assert.strictEqual(
      repo.attributes.description,
      'A sample GitHub repository',
      'Description is correct',
    );
    assert.strictEqual(
      repo.attributes.url,
      'https://github.com/test-user/test-repo',
      'Repository URL is correct',
    );
    assert.strictEqual(
      repo.attributes.language,
      'JavaScript',
      'Language is correctly mapped',
    );
    assert.false(repo.attributes.private, 'Private flag is correctly mapped');
    assert.strictEqual(
      repo.attributes.branchesUrl,
      'https://api.github.com/repos/test-user/test-repo/branches',
      'Branches URL is correctly formatted',
    );

    assert.deepEqual(
      normalizedResponse.meta,
      { totalPages: 1 },
      'Meta information is correctly included',
    );
  });

  test('it correctly handles missing language field', function (assert) {
    let store = this.owner.lookup('service:store');
    let serializer = this.owner.lookup('serializer:repo');

    let rawPayload = {
      data: [
        {
          id: 2,
          name: 'repo-without-language',
          owner: { login: 'test-user' },
          description: 'A repo without a language field',
          html_url: 'https://github.com/test-user/repo-without-language',
          private: true,
          branches_url:
            'https://api.github.com/repos/test-user/repo-without-language/branches{/branch}',
        },
      ],
      meta: { totalPages: 1 },
    };

    let normalizedResponse = serializer.normalizeArrayResponse(
      store,
      null,
      rawPayload,
    );
    let repo = normalizedResponse.data[0];

    assert.strictEqual(
      repo.attributes.language,
      'Unknown',
      'Missing language defaults to "Unknown"',
    );
  });

  test('it correctly handles an empty payload', function (assert) {
    let store = this.owner.lookup('service:store');
    let serializer = this.owner.lookup('serializer:repo');

    let rawPayload = { data: [], meta: {} };

    let normalizedResponse = serializer.normalizeArrayResponse(
      store,
      null,
      rawPayload,
    );

    assert.ok(Array.isArray(normalizedResponse.data), 'Data is an array');
    assert.strictEqual(
      normalizedResponse.data.length,
      0,
      'Handles empty payload correctly',
    );
  });
});
