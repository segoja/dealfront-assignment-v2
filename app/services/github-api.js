import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class GithubApiService extends Service {
  @tracked token = '';
  @tracked name = '';

  async fetchRepos(org, token, type = 'all', page = 1, perPage = 30) {
    try {
      if (!org || !token) {
        throw new Error('Organization name and token are required.');
      }
      // let targetUrl = `https://api.github.com/user/repos?type=${type}&per_page=${perPage}&page=${page}`; // To get my own repos
      let targetUrl = `https://api.github.com/orgs/${org}/repos?type=${type}&per_page=${perPage}&page=${page}`;

      let response = await fetch(targetUrl, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'vnd.github+json', // Setting to application/vnd.github+json is recommended.
        },
      });

      if (!response.ok) {
        switch (response.status) {
          case 403: {
            throw new Error('GitHub API error 403: Forbidden');
          }
          case 404: {
            throw new Error('GitHub API error 404: Organization not found');
          }
          case 401: {
            throw new Error('GitHub API error 401: Unauthorized Access');
          }
          default: {
            throw new Error(
              'GitHub API error: ' + response.status + response.statusText,
            );
          }
        }
      }

      let data = (await response.json()) || [];

      let repos = data.map((repo) => {
        return {
          id: repo.id,
          name: repo.name,
          owner: repo.owner.login,
          description: repo.description,
          url: repo.html_url,
          language: repo.language || 'Unknown',
          private: repo.private,
          branchesUrl: repo.branches_url
            ? repo.branches_url.replace('{/branch}', '')
            : null,
        };
      });

      return { repos, headers: response.headers, error: null };
    } catch (error) {
      // console.error('Error fetching repositories:', error);
      return { repos: [], headers: [], error: error.message }; // Return an error message
    }
  }

  async fetchBranches(branchesUrl, token, page = 1, perPage = 10) {
    try {
      if (!branchesUrl || !token) {
        throw new Error('Organization token is required.');
      }

      let response = await fetch(
        branchesUrl + `?per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'vnd.github+json', // Setting to application/vnd.github+json is recommended.
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          'GitHub API error: ' + response.status + response.statusText,
        );
      }
      let data = (await response.json()) || [];

      let branches = data.map((branch) => {
        return {
          name: branch.name,
          protected: branch.protected,
        };
      });
      return { branches, headers: response.headers, error: null };
    } catch (error) {
      // console.error('Error fetching repositories:', error);
      return { branches: [], headers: [], error: error.message };
    }
  }

  /**
   * Extracts the total number of pages from a Link header.
   *
   * @method extractTotalPages
   * @param {Headers} headers The Link header from a GitHub API response.
   * @return {Number} The total number of pages.
   */
  extractTotalPages(headers) {
    let linkHeader = headers.get('Link');
    if (!linkHeader) {
      return 1; // No pagination, only 1 page
    }
    let lastPageMatch = linkHeader.match(/&page=(\d+)>; rel="last"/);
    return lastPageMatch ? Number(lastPageMatch[1]) : 1;
  }
}
