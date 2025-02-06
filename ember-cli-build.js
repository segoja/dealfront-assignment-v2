'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    // Add options here
    // Ensure autoImport is enabled for Bootstrap
    autoImport: {
      watchDependencies: ['bootstrap'],
    },
  });

  return app.toTree();
};
