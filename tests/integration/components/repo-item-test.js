import { module, test } from 'qunit';
import { setupRenderingTest } from 'repo-viewer/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

// Mock GitHub API Service
class MockGithubApiService extends Service {
  async fetchBranches(branchesUrl, token, page = 1, perPage = 10) {
    if (!branchesUrl || !token) {
      return {
        branches: [],
        headers: [],
        error: 'Organization token is required.',
      };
    }

    if (
      branchesUrl ===
      'https://api.github.com/repos/test-user/empty-repo/branches'
    ) {
      return {
        branches: [],
        headers: new Headers({ 'Content-Type': 'application/json' }),
        error: null,
      };
    }

    if (perPage == 1) {
      return {
        branches: [
          ...[...Array(20).keys()].map((i) => ({
            name: `branch-${i + 1}`,
            protected: (i + 1) % 2 === 0, // Alternate protection
          })),
        ],
        headers: new Map([['Link', '20']]),
        error: null,
      };
    }

    if (page === 1) {
      return {
        branches: [
          ...[...Array(10).keys()].map((i) => ({
            name: `branch-${i + 1}`,
            protected: (i + 1) % 2 === 0, // Alternate protection
          })),
        ],
        headers: new Map([['Link', '2']]),
        error: null,
      };
    } else if (page === 2) {
      return {
        branches: [
          ...[...Array(10).keys()].map((i) => ({
            name: `branch-${i + 10}`,
            protected: (i + 1) % 2 === 0, // Alternate protection
          })),
        ],
        headers: new Map([['Link', '2']]),
        error: null,
      };
    }

    return { branches: [], headers: new Map(), error: null };
  }

  extractTotalPages(headers) {
    return Number(headers.get('Link'));
  }
}

module('Integration | Component | repo-item', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.register('service:githubApi', MockGithubApiService);

    this.set('repo', {
      id: 1296270,
      name: 'test-repo',
      owner: 'test-user',
      description: 'A test repo',
      url: 'https://github.com/test-user/test-repo',
      language: 'JavaScript',
      private: false,
      branchesUrl: 'https://api.github.com/repos/test-user/test-repo/branches',
    });

    this.set('token', 'fake-token');
  });

  test('it renders repo details correctly', async function (assert) {
    await render(hbs`<RepoItem @repo={{this.repo}} @token={{this.token}} />`);

    assert
      .dom('a[href="https://github.com/test-user/test-repo"]')
      .hasText('test-repo');
    assert.dom('.badge').hasText('Public');
    assert.dom('.text-muted small').hasTextContaining('Language: JavaScript');
  });

  test('it fetches and displays branches when toggled', async function (assert) {
    await render(hbs`<RepoItem @repo={{this.repo}} @token={{this.token}} />`);

    assert.dom('.list-group').doesNotExist();

    await click('#repo-1296270 button[title="Show"]');

    assert.dom('.list-group').exists();
    assert.dom('.list-group-item').exists({ count: 10 });
    assert.dom('.list-group-item').includesText('branch-');
  });

  test('it loads more branches when clicking "Load More"', async function (assert) {
    await render(hbs`<RepoItem @repo={{this.repo}} @token={{this.token}} />`);

    await click('button svg');

    assert.dom('.list-group-item').exists({ count: 10 });

    await click('button:last-child');

    assert.dom('.list-group-item').exists({ count: 20 });
  });

  test('it handles API errors checking number of branches', async function (assert) {
    this.owner.register(
      'service:githubApi',
      class extends MockGithubApiService {
        async fetchBranches() {
          return { branches: [], headers: [], error: 'API Error' };
        }
      },
    );

    await render(hbs`<RepoItem @repo={{this.repo}} @token={{this.token}} />`);

    assert.dom('.alert-danger').hasTextContaining('API Error');
  });
});
