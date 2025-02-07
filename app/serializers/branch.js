import RESTSerializer from '@ember-data/serializer/rest';

export default class BranchSerializer extends RESTSerializer {
  normalizeArrayResponse(
    store,
    primaryModelClass,
    payload /*, id, requestType*/,
  ) {
    let dataArray = payload.data || [];
    return {
      data: dataArray.map((branch) => {
        return {
          id: branch.id,
          type: 'branch',
          attributes: branch.attributes,
          relationships: branch.relationships,
        };
      }),
      meta: payload.meta,
    };
  }
}
