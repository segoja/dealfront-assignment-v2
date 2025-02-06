import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class RepoListComponent extends Component {
  @service githubApi;

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
    return this.repos.length === 0 || this.isLoading;
  }

  get disableNext() {
    return this.githubApi.currentPage >= this.githubApi.totalPages;
  }

  get disablePrev() {
    return this.githubApi.currentPage <= 1;
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

  @action
  async getRepoData() {
    this.checkEmpty();
    if (this.nameError || this.tokenError) {
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
      this.isLoading = false;
    }
  }

  @action
  async loadMore() {
    if (this.currentPage <= this.totalPages) {
      this.currentPage++;
      this.isLoading = true;
      let response = await this.githubApi.fetchRepos(
        this.name,
        this.token,
        'all',
        this.currentPage,
      );
      this.repos = this.repos.concat(response.repos);
      this.isLoading = false;
    }
  }
}
