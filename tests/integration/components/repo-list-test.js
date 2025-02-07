import { module, test } from 'qunit';
import { setupRenderingTest } from 'repo-viewer/tests/helpers';
import { render, click, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { Response } from 'miragejs';

module('Integration | Component | repo-list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders inputs and buttons', async function (assert) {
    await render(hbs`<RepoList />`);

    assert.dom('input[name="name"]').exists();
    assert.dom('input[name="token"]').exists();
    assert.dom('button.btn-success').hasText('Find Repositories');
  });

  test('it fetches and displays repositories', async function (assert) {
    this.server.createList('repo', 30, { owner: { login: 'test-org' } });

    await render(hbs`<RepoList />`);

    await fillIn('input[name="name"]', 'test-org');
    await fillIn('input[name="token"]', 'fake-token');
    await click('button');

    assert.dom('.alert-default').doesNotExist();
    assert.dom('.repo-item').exists({ count: 30 });
  });

  test('it shows an error message when API fails', async function (assert) {
    this.server.get('https://api.github.com/orgs/:org/repos', () => {
      return new Response(500, {}, 'API Error');
    });

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

    assert.dom('.repo-item').exists({ count: 15 });
    assert.dom('.repo-item').includesText('JavaScript');

    await fillIn('input[name="language"]', 'impossiblelanguage');

    assert.dom('.alert-info').exists();
  });

  test('it filters out private repositories', async function (assert) {
    await render(hbs`<RepoList />`);

    await fillIn('input[name="name"]', 'test-org');
    await fillIn('input[name="token"]', 'fake-token');
    await click('button');

    await click('input[name="private"]');

    assert.dom('.repo-item').exists({ count: 15 });
    assert.dom('.repo-item').includesText('Public');
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

    assert.dom('.repo-item').exists({ count: 30 });

    await click('.col-auto button.btn-link.link-underline-dark');

    assert.dom('.repo-item').exists({ count: 50 });
  });
});
