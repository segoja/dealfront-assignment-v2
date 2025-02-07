import RESTAdapter from '@ember-data/adapter/rest';
import { Octokit } from '@octokit/rest';

export default class BranchAdapter extends RESTAdapter {
  host = 'https://api.github.com';

  async query(store, type, query) {
    let { repoId, repoName, org, token, page = 1, perPage = 10 } = query;

    if (!repoId || !org || !token || !repoName) {
      throw new Error(
        'Repo ID, Repo name, organization, and token are required.',
      );
    }

    let octokit = new Octokit({ auth: token });

    let response = await octokit.request('GET /repos/{owner}/{repo}/branches', {
      owner: org,
      repo: repoName,
      per_page: perPage,
      page,
    });

    let totalPages = this.extractTotalPages(response.headers) || 1; // Ensure a default value

    return {
      data: response.data.map((branch) => ({
        id: branch.name.toString(),
        attributes: {
          name: branch.name,
          protected: branch.protected,
        },
        relationships: {
          repo: { data: { type: 'repo', id: repoId } },
        },
      })),
      meta: { totalPages },
    };
  }

  extractTotalPages(headers) {
    let linkHeader = headers?.link;
    if (!linkHeader) return 1;

    let lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
    return lastPageMatch ? Number(lastPageMatch[1]) : 1;
  }
}
