import { setupTest } from 'repo-viewer/tests/helpers';
import { module, test } from 'qunit';

module('Unit | Serializer | branch', function (hooks) {
  setupTest(hooks);

  test('it correctly normalizes GitHub API branch data', function (assert) {
    let store = this.owner.lookup('service:store');
    let serializer = this.owner.lookup('serializer:branch');

    let rawPayload = {
      data: [
        {
          id: 'main',
          attributes: {
            name: 'main',
            protected: true,
          },
          relationships: {
            repo: { data: { type: 'repo', id: '1' } },
          },
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
      'Correct number of branches returned',
    );

    let branch = normalizedResponse.data[0];

    assert.strictEqual(branch.id, 'main', 'ID is correctly assigned');
    assert.deepEqual(
      branch.attributes,
      { name: 'main', protected: true },
      'Attributes are correctly mapped',
    );
    assert.deepEqual(
      branch.relationships,
      { repo: { data: { type: 'repo', id: '1' } } },
      'Relationships are correctly mapped',
    );

    assert.deepEqual(
      normalizedResponse.meta,
      { totalPages: 1 },
      'Meta information is correctly included',
    );
  });

  test('it correctly handles an empty payload', function (assert) {
    let store = this.owner.lookup('service:store');
    let serializer = this.owner.lookup('serializer:branch');

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
