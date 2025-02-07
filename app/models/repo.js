import Model, { attr, hasMany } from '@ember-data/model';

export default class RepoModel extends Model {
  @attr('string') name;
  @attr('string') owner;
  @attr('string') description;
  @attr('string') url;
  @attr('string') language;
  @attr('boolean') private;
  @attr('string') branchesUrl;
  @hasMany('branch', { async: true, inverse: 'repo' }) branches;
}
