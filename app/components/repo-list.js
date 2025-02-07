import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class RepoListComponent extends Component {
  @service store;

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
    return this.totalRepos === 0 || this.isLoading || this.errorMessage;
  }

  get showSalute() {
    return this.name === '' || this.token === '';
  }

  get showLoading() {
    return this.isLoading && this.totalRepos === 0;
  }

  @action checkEmpty() {
    this.nameError = this.name === '';
    this.tokenError = this.token === '';
  }

  @action updateValue(element) {
    this[element.target.name] =
      element.target.type === 'checkbox'
        ? element.target.checked
        : element.target.value;
  }

  async fetchRepoData(page = 1, perPage = 30, resetRepos = false) {
    this.checkEmpty();
    if (this.nameError || this.tokenError) {
      this.searched = false;
      console.debug('Name or token is empty');
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;
    const { name: org, token } = this;

    try {
      if (resetRepos) {
        this.repos = [];
        this.currentPage = 1;
        let response = await this.store.query('repo', {
          org,
          token,
          page: 1,
          perPage: 1,
        });
        this.totalRepos = response.meta?.totalPages || 0;
      }

      let response = await this.store.query('repo', {
        org,
        token,
        page,
        perPage,
      });
      this.totalPages = response.meta?.totalPages || 0;
      this.repos = this.store
        .peekAll('repo')
        .filter((repo) => repo.owner === org);
    } catch (error) {
      this.errorMessage = error.message;
      console.debug('Error:', error);
    } finally {
      this.isLoading = false;
      this.searched = true;
    }
  }

  @action async getRepoData() {
    await this.fetchRepoData(1, 30, true);
  }

  @action async loadMore() {
    if (this.currentPage < this.totalPages) {
      await this.fetchRepoData(++this.currentPage, 30, false);
    }
  }
}
