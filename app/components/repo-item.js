import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class RepoItem extends Component {
  @service githubApi;
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

  @action
  async getBranches() {
    if (!this.args.token || !this.args.repo) {
      console.debug('Token is empty');
      return;
    } else {
      this.isLoading = true;

      this.isLoading = true;
      this.errorMessage = '';
      this.currentPage = 1;

      let token = this.args.token;
      let repoId = this.args.repo.id;
      let repoName = this.args.repo.name;
      let org = this.args.repo.owner;
      let page = this.currentPage;
      try {
        let branches = await this.store.query('branch', {
          repoId,
          repoName,
          org,
          token,
          page,
          perPage: 10,
        });
        this.totalPages = branches.meta?.totalPages || 1; // Default to 1 to avoid null
        branches = await branches.slice();
        branches = branches.map((branch) => ({
          id: branch.id,
          name: branch.name,
          protected: branch.protected,
        }));
        this.branches = branches;
        console.log('Branches: ', this.branches);
        this.isLoading = false;
      } catch (error) {
        this.errorMessage = error.message;
        this.isLoading = false;
        console.log('Error: ', error);
      }
    }
  }
  @action
  async getTotalBranches() {
    // this.store.findAll('branch', { adapterOptions: { repoId: this.args.repo.id, page: 1, perPage: 10 } });
    if (!this.args.token || !this.args.repo) {
      console.debug('Token is empty');
      return;
    } else {
      this.isLoading = true;
      this.errorMessage = '';
      this.currentPage = 1;

      let token = this.args.token;
      let repoId = this.args.repo.id;
      let repoName = this.args.repo.name;
      let org = this.args.repo.owner;

      try {
        let totalbranches = await this.store.query('branch', {
          repoId,
          repoName,
          org,
          token,
          page: 1,
          perPage: 1,
        });
        this.totalBranches = totalbranches.meta?.totalPages || 1; // Default to 1 to avoid null
        this.isLoading = false;
      } catch (error) {
        this.errorMessage = error.message;
        this.isLoading = false;
        console.log('Error: ', error);
      }
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

      let token = this.args.token;
      let repoId = this.args.repo.id;
      let repoName = this.args.repo.name;
      let org = this.args.repo.owner;
      let page = this.currentPage;
      try {
        let moreBranches = await this.store.query('branch', {
          repoId,
          repoName,
          org,
          token,
          page,
          perPage: 10,
        });
        moreBranches = await moreBranches.slice();
        moreBranches = moreBranches.map((branch) => ({
          id: branch.id,
          name: branch.name,
          protected: branch.protected,
        }));

        this.branches = this.branches.concat(moreBranches);
        this.isLoading = false;
      } catch (error) {
        this.errorMessage = error.message;
        this.isLoading = false;
        console.log('Error: ', error);
      }
    }
  }
}
