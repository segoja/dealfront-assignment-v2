import Model, { attr, belongsTo } from '@ember-data/model';

export default class BranchModel extends Model {
  @attr('string') name;
  @attr('boolean') protected;
  @belongsTo('repo', { async: true, inverse: 'branches' }) repo;
}
