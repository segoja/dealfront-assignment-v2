import { module, test } from 'qunit';
import { setupRenderingTest } from 'repo-viewer/tests/helpers';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

// Mock GitHub API Service
class MockGithubApiService extends Service {
  async fetchRepos(org, token, type = 'all', page = 1, perPage = 30) {
    if (!org || !token) {
      return {
        repos: [],
        headers: [],
        error: 'Organization name and token are required.',
      };
    }
    if (org === 'empty-org') {
      return {
        repos: [],
        headers: new Headers({ 'Content-Type': 'application/json' }),
        error: null,
      };
    }

    if (page === 1 && perPage === 1 && org === 'paginated-org' && type) {
      return {
        repos: [
          ...[...Array(60).keys()].map((index) => ({
            id: 1296269 + index, // Just to make unique IDs
            name: `Repo-${index + 1}`,
            owner: { login: 'paginated-org' },
            description: `A test repo number ${index + 1}`,
            html_url: `https://github.com/test-org/repo-${index + 1}`,
            language: index % 2 === 0 ? 'JavaScript' : 'Python', // Alternate languages
            private: index % 2 === 0, // Alternate private status
            branches_url: `https://api.github.com/repos/test-org/repo-${index + 1}/branches{/branch}`,
          })),
        ],
        headers: new Headers({
          'Content-Type': 'application/json',
          Link: '60',
        }),
        error: null,
      };
    }
    return {
      repos: [
        ...[...Array(30).keys()].map((index) => ({
          id: page === 2 ? 1296299 + index : 1296269 + index, // Just to make unique IDs also for page 2
          name: `Repo-${index + 1}`,
          owner: { login: 'test-org' },
          description: `A test repo number ${index + 1}`,
          html_url: `https://github.com/test-org/repo-${index + 1}`,
          language: index % 2 === 0 ? 'JavaScript' : 'Python', // Alternate languages
          private: index % 2 === 0, // Alternate private status
          branches_url: `https://api.github.com/repos/test-org/repo-${index + 1}/branches{/branch}`,
        })),
      ],
      headers: new Headers({
        'Content-Type': 'application/json',
        Link: '2',
      }),
      error: null,
    };
  }

  async fetchBranches(branchesUrl, token) {
    if (!branchesUrl || !token) {
      return {
        branches: [],
        headers: [],
        error: 'Organization token is required.',
      };
    }
    return {
      branches: [],
      headers: new Map(),
      error: null,
    };
  }

  extractTotalPages(headers) {
    return Number(headers.get('Link'));
  }
}

module('Integration | Component | repo-list', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:githubApi', MockGithubApiService);
  });

  test('it renders inputs and buttons', async function (assert) {
    await render(hbs`<RepoList />`);

    assert.dom('input[name="name"]').exists();
    assert.dom('input[name="token"]').exists();
    assert.dom('button.btn-success').hasText('Find Repositories');
  });

  test('it fetches and displays repositories', async function (assert) {
    await render(hbs`<RepoList />`);

    await fillIn('input[name="name"]', 'test-org');
    await fillIn('input[name="token"]', 'fake-token');
    await click('button');

    assert.dom('.alert-default').doesNotExist();
    assert.dom('#repo-1296270').exists();
  });

  test('it shows an error message when API fails', async function (assert) {
    this.owner.register(
      'service:githubApi',
      class extends MockGithubApiService {
        async fetchRepos() {
          return { repos: [], headers: [], error: 'API Error' };
        }
      },
    );

    await render(hbs`<RepoList />`);
    await fillIn('input[name="name"]', 'test-org');
    await fillIn('input[name="token"]', 'fake-token');
    await click('button');

    assert.dom('.alert-danger').exists();
  });

  test('it filters repositories by language', async function (assert) {
    await render(hbs`<RepoList />`);

    await fillIn('input[name="name"]', 'test-org');
    await fillIn('input[name="token"]', 'fake-token');
    await click('button');

    await fillIn('input[name="language"]', 'JavaScript');

    assert.dom('#repo-1296270').doesNotExist();
    assert.dom('#repo-1296271').exists();

    await fillIn('input[name="language"]', 'impossiblelanguage');

    assert.dom('.alert-info').exists();
  });

  test('it filters out private repositories', async function (assert) {
    await render(hbs`<RepoList />`);

    await fillIn('input[name="name"]', 'test-org');
    await fillIn('input[name="token"]', 'fake-token');
    await click('button');

    await click('input[name="private"]');

    assert.dom('#repo-1296271').doesNotExist();
    assert.dom('#repo-1296270').exists();
  });

  test('it shows "No repositories found" when empty', async function (assert) {
    await render(hbs`<RepoList />`);

    await fillIn('input[name="name"]', 'empty-org');
    await fillIn('input[name="token"]', 'fake-token');
    await click('button');

    assert.dom('.alert-default').hasText('No repositories found.');
  });

  test('it loads more repositories when "Load More" is clicked', async function (assert) {
    await render(hbs`<RepoList />`);

    await fillIn('input[name="name"]', 'paginated-org');
    await fillIn('input[name="token"]', 'fake-token');
    await click('button');

    assert.dom('#repo-1296270').exists();

    await click('button.link-underline-dark');

    assert.dom('#repo-1296310').exists();
  });
});
