import { module, test } from 'qunit';
import { setupRenderingTest } from 'repo-viewer/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | repo-item', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<RepoItem />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`
      <RepoItem>
        template block text
      </RepoItem>
    `);

    assert.dom().hasText('template block text');
  });
});
