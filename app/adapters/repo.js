import RESTAdapter from '@ember-data/adapter/rest';
import { Octokit } from '@octokit/rest';

export default class RepoAdapter extends RESTAdapter {
  host = 'https://api.github.com';

  async query(store, type, query) {
    let { org, token, page = 1, perPage = 30 } = query;

    if (!org || !token) {
      throw new Error('Organization name and token are required.');
    }

    let octokit = new Octokit({ auth: token });

    let response = await octokit.request('GET /orgs/{org}/repos', {
      org,
      type: 'all',
      per_page: perPage,
      page,
    });

    let totalPages = this.extractTotalPages(response.headers) || 0;

    return {
      data: response.data,
      meta: { totalPages },
    };
  }

  extractTotalPages(headers) {
    let linkHeader = headers?.link;
    if (!linkHeader) return 0;

    let lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
    return lastPageMatch ? Number(lastPageMatch[1]) : 1;
  }
}
