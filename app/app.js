import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from 'repo-viewer/config/environment';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensures CSS loads
import 'bootstrap'; // Loads Bootstrap JavaScript

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
}

loadInitializers(App, config.modulePrefix);
