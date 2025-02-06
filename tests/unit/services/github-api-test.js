import { module, test } from 'qunit';
import { setupTest } from 'repo-viewer/tests/helpers';

module('Unit | Service | github-api', function (hooks) {
  setupTest(hooks);

  let originalFetch;

  hooks.beforeEach(function () {
    originalFetch = globalThis.fetch; // Save original fetch
  });

  hooks.afterEach(function () {
    globalThis.fetch = originalFetch; // Restore original fetch
  });

  // Generate 30 repositories with the required structure
  const fakeRepos = Array.from({ length: 30 }, (_, index) => ({
    id: 1296269 + index, // Just to make unique IDs
    node_id: `MDEwOlJlcG9zaXRvcnkxMjk2MjY${index}`,
    name: `Repo-${index + 1}`,
    owner: { login: 'test-org' },
    description: `A test repo number ${index + 1}`,
    html_url: `https://github.com/test-org/repo-${index + 1}`,
    language: index % 2 === 0 ? 'JavaScript' : 'Python', // Alternate languages
    private: index % 2 === 0, // Alternate private status
    branches_url: `https://api.github.com/repos/test-org/repo-${index + 1}/branches{/branch}`,
  }));

  test('fetchRepos() should return a list of repositories', async function (assert) {
    let service = this.owner.lookup('service:github-api');

    // Mock fetch response
    globalThis.fetch = async () =>
      new Response(JSON.stringify(fakeRepos), {
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/json',
          Link: '<https://api.github.com/organizations/9999/repos?type=all&per_page=30&page=1>; rel="prev", <https://api.github.com/organizations/9999/repos?type=all&per_page=30&page=3>; rel="next", <https://api.github.com/organizations/9999/repos?type=all&per_page=30&page=4>; rel="last", <https://api.github.com/organizations/9999/repos?type=all&per_page=30&page=1>; rel="first"',
        }),
      });

    let { repos, headers, error } = await service.fetchRepos(
      'test-org',
      'fake-token',
      'all',
      1,
      30,
    );

    assert.strictEqual(error, null, 'No error should be returned');
    assert.strictEqual(repos.length, 30, 'Should return 30 repos');
    assert.strictEqual(repos[0].name, 'Repo-1', 'Repo name should match');
    assert.strictEqual(repos[0].owner, 'test-org', 'Owner should match');
    assert.strictEqual(
      repos[0].description,
      'A test repo number 1',
      'Description should match',
    );
    assert.strictEqual(
      repos[0].url,
      'https://github.com/test-org/repo-1',
      'Repo URL should match',
    );
    assert.strictEqual(
      repos[0].language,
      'JavaScript',
      'Language should match',
    );
    assert.true(repos[0].private, 'First repo should be private');

    // Test extracting total pages
    let totalPages = service.extractTotalPages(headers);
    assert.strictEqual(
      totalPages,
      4,
      'Should extract correct total pages from Link header',
    );
  });

  test('fetchRepos() should handle an empty repository list', async function (assert) {
    let service = this.owner.lookup('service:github-api');

    // Mock fetch response with empty array
    globalThis.fetch = async () =>
      new Response(JSON.stringify([]), {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

    let { repos, error } = await service.fetchRepos(
      'test-org',
      'fake-token',
      'all',
      1,
      30,
    );

    assert.deepEqual(repos, [], 'Should return an empty array');
    assert.strictEqual(error, null, 'Should return no error message');
  });

  test('fetchRepos() should handle a fetch error', async function (assert) {
    let service = this.owner.lookup('service:github-api');

    // Mock fetch to return a failed response
    globalThis.fetch = async () =>
      new Response(null, {
        status: 403,
        statusText: 'Forbidden',
      });

    let { repos, error } = await service.fetchRepos(
      'test-org',
      'fake-token',
      'all',
      1,
      30,
    );

    assert.deepEqual(repos, [], 'Should return an empty array');
    assert.ok(error.includes('GitHub API error'), 'Should return an API error');
  });

  // Branches
  let fakeBranches = [
    { name: 'main', protected: true },
    { name: 'next', protected: false },
    ...[...Array(23).keys()].map((i) => ({
      name: `branch-${i + 1}`,
      protected: (i + 1) % 2 === 0, // Alternate protection
    })),
  ];

  fakeBranches = fakeBranches.slice(0, 10);

  test('fetchBranches() should return a list of branches', async function (assert) {
    let service = this.owner.lookup('service:github-api');

    // Mock fetch response
    globalThis.fetch = async () =>
      new Response(JSON.stringify(fakeBranches), {
        status: 200,
        headers: new Headers({
          'Content-Type': 'application/json',
          Link: '<https://api.github.com/repositories/9999/branches?per_page=10&page=2>; rel="next", <https://api.github.com/repositories/9999/branches?per_page=10&page=3>; rel="last"',
        }),
      });

    let { branches, headers, error } = await service.fetchBranches(
      'https://api.github.com/repos/test-org/repo-1/branches',
      'fake-token',
      1,
      10,
    );

    assert.strictEqual(error, null, 'No error should be returned');
    assert.strictEqual(branches.length, 10, 'Should return 10 branches');
    assert.strictEqual(
      branches[2].name,
      'branch-1',
      'Branch name should match',
    );
    assert.false(branches[2].protected, 'First branch should be not private');

    // Test extracting total pages
    let totalPages = service.extractTotalPages(headers);
    assert.strictEqual(
      totalPages,
      3,
      'Should extract correct total pages from Link header',
    );
  });

  test('fetchBranches() should handle an empty branches list', async function (assert) {
    let service = this.owner.lookup('service:github-api');

    // Mock fetch response with empty array
    globalThis.fetch = async () =>
      new Response(JSON.stringify([]), {
        status: 200,
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

    let { branches, error } = await service.fetchBranches(
      'https://api.github.com/repos/test-org/repo-1/branches',
      'fake-token',
      1,
      10,
    );

    assert.deepEqual(branches, [], 'Should return an empty array');
    assert.strictEqual(error, null, 'Should return no error message');
  });

  test('fetchBranches() should handle a fetch error', async function (assert) {
    let service = this.owner.lookup('service:github-api');

    // Mock fetch to return a failed response
    globalThis.fetch = async () =>
      new Response(null, {
        status: 403,
        statusText: 'Forbidden',
      });

    let { branches, error } = await service.fetchBranches(
      'https://api.github.com/repos/test-org/repo-1/branches',
      'fake-token',
      1,
      10,
    );

    assert.deepEqual(branches, [], 'Should return an empty array');
    assert.ok(error.includes('GitHub API error'), 'Should return an API error');
  });
});
