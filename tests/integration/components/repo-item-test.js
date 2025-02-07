import { module, test } from 'qunit';
import { setupRenderingTest } from 'repo-viewer/tests/helpers';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';

module('Integration | Component | repo-item', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.repo = {
      id: '10',
      name: 'test-repo',
      owner: 'test-user',
      description: 'A test repo',
      url: 'https://github.com/test-user/test-repo',
      language: 'JavaScript',
      private: false,
    };

    this.token = 'fake-token';
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

    await click('button[title="Show"]');

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
    this.server.get(
      'https://api.github.com/repos/:owner/:repo/branches',
      () => {
        return new Response(500, {}, 'API Error');
      },
    );

    await render(hbs`<RepoItem @repo={{this.repo}} @token={{this.token}} />`);

    assert.dom('.alert-default').hasTextContaining('API Error');
  });
});
