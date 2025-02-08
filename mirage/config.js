import {
  discoverEmberDataModels,
  // applyEmberDataSerializers,
} from 'ember-cli-mirage';
import { createServer, Response } from 'miragejs';

export default function (config) {
  let finalConfig = {
    ...config,
    models: {
      ...discoverEmberDataModels(config.store),
      ...config.models,
    },
    routes,
  };

  return createServer(finalConfig);
}

function routes() {
  // Mock Repositories Response
  this.get('https://api.github.com/orgs/:org/repos', (schema, request) => {
    let { org } = request.params;
    let page = Number(request.queryParams.page) || 1;
    let perPage = Number(request.queryParams.per_page) || 30;

    if (org === 'broken-org') {
      return new Response(500, {}, 'API Error');
    }

    if (org === 'empty-org') {
      return new Response(200, {}, []);
    }

    let repos = [...Array(50).keys()].map((i) => ({
      id: i + 1,
      name: `${org}-repo-${i + 1}`,
      owner: { login: org },
      description: `Mocked repo ${i + 1}`,
      html_url: `https://github.com/${org}/repo-${i + 1}`,
      language: ['JavaScript', 'Python'][i % 2],
      private: i % 2 === 0,
      branches_url: `https://api.github.com/repos/${org}/repo-${i + 1}/branches{/branch}`,
    }));

    let totalPages = Math.ceil(repos.length / perPage);
    let paginatedRepos = repos.slice((page - 1) * perPage, page * perPage);

    let linkHeader =
      totalPages > 1 && page < totalPages
        ? `<https://api.github.com/orgs/${org}/repos?type=all&per_page=${perPage}&page=${totalPages}>; rel="last"`
        : '';

    return new Response(
      200,
      { link: linkHeader, 'Content-Type': 'application/json' },
      paginatedRepos,
    );
  });

  // Mock Branches Response
  this.get(
    'https://api.github.com/repos/:owner/:repo/branches',
    (schema, request) => {
      let { repo } = request.params;
      let page = Number(request.queryParams.page) || 1;
      let perPage = Number(request.queryParams.per_page) || 10;

      let branches = [...Array(25).keys()].map((i) => ({
        name: `${repo}-branch-${i + 1}`,
        protected: i % 2 === 0,
      }));

      let totalPages = Math.ceil(branches.length / perPage);
      let paginatedBranches = branches.slice(
        (page - 1) * perPage,
        page * perPage,
      );

      let linkHeader =
        totalPages > 1 && page < totalPages
          ? `<https://api.github.com/repos/test-user/${repo}/branches?per_page=${perPage}&page=${totalPages}>; rel="last"`
          : '';

      return new Response(
        200,
        { link: linkHeader, 'Content-Type': 'application/json' },
        paginatedBranches,
      );
    },
  );

  // this.passthrough('https://api.github.com/orgs/:org/repos');
  // this.passthrough('https://api.github.com/repos/:owner/:repo/branches');
}
