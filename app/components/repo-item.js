import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class RepoItem extends Component {
  @service store;
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

  async fetchBranches(page, perPage = 10) {
    if (!this.args.token || !this.args.repo) {
      console.debug('Token is empty');
      return null;
    }
    this.isLoading = true;
    this.errorMessage = '';

    const { token, repo } = this.args;
    const { id: repoId, name: repoName, owner: org } = repo;

    try {
      let branches = await this.store.query('branch', {
        repoId,
        repoName,
        org,
        token,
        page,
        perPage,
      });
      return branches;
    } catch (error) {
      this.errorMessage = error.message;
      return null;
    } finally {
      this.isLoading = false;
    }
  }

  @action
  async getBranches() {
    this.currentPage = 1;
    let branches = await this.fetchBranches(this.currentPage);
    if (branches) {
      this.totalPages = branches.meta?.totalPages || 0;
      this.branches = branches.slice();
    }
  }

  @action
  async getTotalBranches() {
    let totalBranchesData = await this.fetchBranches(1, 1);
    if (totalBranchesData) {
      this.totalBranches = totalBranchesData.meta?.totalPages || 0;
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
    if (this.currentPage < this.totalPages) {
      console.log('Loading more branches...');
      this.currentPage++;
      let moreBranches = await this.fetchBranches(this.currentPage);
      if (moreBranches) {
        this.branches = [...this.branches, ...moreBranches.slice()];
      }
    }
  }
}
