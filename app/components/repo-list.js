import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class RepoListComponent extends Component {
  @service githubApi;
  @service store;

  constructor() {
    super(...arguments);
  }

  @tracked isLoading = false;
  @tracked name = '';
  @tracked token = '';
  @tracked language = '';
  @tracked private = false;
  @tracked selectedRepo = null;
  @tracked selectedBranch = null;
  @tracked nameError = false;
  @tracked tokenError = false;
  @tracked repos = [];
  @tracked searched = false;

  @tracked currentPage = 1;
  @tracked totalRepos = 0;
  @tracked totalPages = 1;
  @tracked errorMessage = '';

  get filteredRepos() {
    let lowerCaseLanguage = this.language.toLowerCase();

    return this.repos.filter((repo) => {
      let matchPrivate = !this.private || !repo.private;
      let matchLanguage =
        !this.language ||
        repo.language.toLowerCase().includes(lowerCaseLanguage);
      return matchPrivate && matchLanguage;
    });
  }

  get isFiltered() {
    return this.language || this.private;
  }

  get thereIsMore() {
    return this.currentPage < this.totalPages;
  }

  get cantFilter() {
    return this.totalRepos === 0 || this.isLoading;
  }

  get showSalute() {
    return this.name == '' || this.token == '';
  }

  get showLoading() {
    return this.isLoading && this.totalRepos === 0;
  }

  @action checkEmpty() {
    this.nameError = this.name === '' ? true : false;
    this.tokenError = this.token === '' ? true : false;
  }

  @action updateValue(element) {
    if (element.target.type === 'checkbox') {
      this[element.target.name] = element.target.checked;
    } else {
      this[element.target.name] = element.target.value;
    }
  }

  /*
  @action
  async getRepoData() {

    console.log('ABout to fetch: ', this.name, this.token);

    this.checkEmpty();
    if (this.nameError || this.tokenError) {
      this.searched = false;
      console.debug('Name or token is empty');
      return;
    } else {
      this.errorMessage = '';
      this.repos = [];
      this.nameError = false;
      this.tokenError = false;
      this.currentPage = 1;
      console.debug('Fetching repositories...');
      this.isLoading = true;
      let { headers, error } = await this.githubApi.fetchRepos(
        this.name,
        this.token,
        'all',
        1,
        1,
      );

      if (error) {
        this.errorMessage = error;
        this.isLoading = false;
        return;
      }

      // We ask for one item per page so we can get the total number of items with the Link header
      this.totalRepos = this.githubApi.extractTotalPages(headers);

      let response = await this.githubApi.fetchRepos(
        this.name,
        this.token,
        'all',
        this.currentPage,
      );
      this.repos = response.repos;
      
      this.totalPages = this.githubApi.extractTotalPages(response.headers);
      this.language = '';
      this.private = false;
      this.isLoading = false;
      this.searched = true;
    }
  }

      */
  @action
  async getRepoData() {
    this.checkEmpty();
    if (this.nameError || this.tokenError) {
      this.searched = false;
      console.debug('Name or token is empty');
      return;
    } else {
      let token = this.token;
      let org = this.name;
      let page = this.currentPage;
      this.errorMessage = '';
      this.repos = [];
      this.nameError = false;
      this.tokenError = false;
      this.currentPage = 1;
      console.debug('Fetching repositories...');
      this.isLoading = true;
      try {
        let totalrepos = await this.store.query('repo', {
          org,
          token,
          page: 1,
          perPage: 1,
        });
        this.totalRepos = totalrepos.meta?.totalPages || 1; // Default to 1 to avoid null
        let repos = await this.store.query('repo', {
          org,
          token,
          page,
          perPage: 30,
        });
        this.totalPages = repos.meta?.totalPages || 1; // Default to 1 to avoid null

        repos = [...(await repos.slice())];
        repos = repos.map((repo) => ({
          id: repo.id,
          name: repo.name,
          owner: repo.owner,
          description: repo.description,
          url: repo.url,
          language: repo.language,
          private: repo.private,
          branchesUrl: repo.branchesUrl,
        }));
        this.repos = repos;
        this.language = '';
        this.private = false;
        this.isLoading = false;
        this.searched = true;
        console.log('Total pages: ', this.totalPages);
      } catch (error) {
        this.errorMessage = error.message;
        this.isLoading = false;
        console.log('Error: ', error);
      }
    }
  }

  @action
  async loadMore() {
    if (this.currentPage < this.totalPages) {
      try {
        this.currentPage++;
        let token = this.token;
        let org = this.name;
        let page = this.currentPage;
        this.isLoading = true;
        let moreRepos = await this.store.query('repo', {
          org,
          token,
          page,
          perPage: 30,
        });

        moreRepos = [...(await moreRepos.slice())];
        moreRepos = moreRepos.map((repo) => ({
          id: repo.id,
          name: repo.name,
          owner: repo.owner,
          description: repo.description,
          url: repo.url,
          language: repo.language,
          private: repo.private,
          branchesUrl: repo.branchesUrl,
        }));
        this.repos = this.repos.concat(moreRepos);
        console.log('Repos: ', this.repos);
        this.isLoading = false;
      } catch (error) {
        this.errorMessage = error.message;
        this.isLoading = false;
        console.log('Error: ', error);
      }
    }
  }
}
