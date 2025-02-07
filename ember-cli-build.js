'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    // Add options here
    emberData: {
      deprecations: {
        DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false,
      },
    },
    // Ensure autoImport is enabled for Bootstrap
    autoImport: {
      watchDependencies: ['bootstrap'],
    },
  });

  return app.toTree();
};
