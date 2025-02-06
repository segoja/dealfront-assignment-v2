import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class RepoItem extends Component {
  @service githubApi;
  @tracked branches = [];
  @tracked isLoading = false;
  @tracked hasBranches = false;
  @tracked currentPage = 1;
  @tracked totalPages = 1;
  @tracked totalBranches = 0;
  @tracked errorMessage = '';

  constructor() {
    super(...arguments);
    this.getTotalBranches();
  }

  get thereIsMore() {
    return this.currentPage < this.totalPages;
  }

  get notReady() {
    return this.totalBranches === 0 && this.isLoading;
  }

  @action
  async getBranches() {
    if (!this.args.token || !this.args.repo.branchesUrl) {
      console.debug('Token is empty');
      return;
    } else {
      this.isLoading = true;
      let response = await this.githubApi.fetchBranches(
        this.args.repo.branchesUrl,
        this.args.token,
      );
      this.totalPages = this.githubApi.extractTotalPages(response.headers);
      this.branches = response.branches;
      this.isLoading = false;
    }
  }
  @action
  async getTotalBranches() {
    if (!this.args.token || !this.args.repo.branchesUrl) {
      console.debug('Token is empty');
      return;
    } else {
      this.isLoading = true;
      this.errorMessage = '';
      this.currentPage = 1;

      // We ask for one item per page so we can get the total number of items with the Link header
      let { headers, error } = await this.githubApi.fetchBranches(
        this.args.repo.branchesUrl,
        this.args.token,
        1,
        1,
      );

      if (error) {
        this.errorMessage = error;
        this.isLoading = false;
        return;
      }

      this.totalBranches = this.githubApi.extractTotalPages(headers);
      this.isLoading = false;
    }
  }

  @action
  toggleBranches() {
    this.hasBranches = !this.hasBranches;
    if (this.hasBranches && this.branches.length === 0) {
      this.getBranches();
    }
  }

  @action
  async loadMore() {
    if (this.currentPage <= this.totalPages) {
      console.log('Loading more branches...');
      this.currentPage++;
      this.isLoading = true;
      let response = await this.githubApi.fetchBranches(
        this.args.repo.branchesUrl,
        this.args.token,
        this.currentPage,
      );
      this.branches = this.branches.concat(response.branches);
      this.isLoading = false;
    }
  }
}
