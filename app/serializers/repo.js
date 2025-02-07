import RESTSerializer from '@ember-data/serializer/rest';

export default class RepoSerializer extends RESTSerializer {
  normalizeArrayResponse(
    store,
    primaryModelClass,
    payload /*, id, requestType*/,
  ) {
    let dataArray = payload.data || [];
    return {
      data: dataArray.map((repo) => {
        return {
          id: repo.id.toString(),
          type: 'repo',
          attributes: {
            name: repo.name,
            owner: repo.owner.login,
            description: repo.description,
            url: repo.html_url,
            language: repo.language || 'Unknown',
            private: repo.private,
            branchesUrl: repo.branches_url.replace('{/branch}', ''),
          },
        };
      }),
      meta: payload.meta || {},
    };
  }
}
