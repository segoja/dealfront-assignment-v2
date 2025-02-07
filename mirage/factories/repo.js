import { Factory } from 'miragejs';

export default Factory.extend({
  id(i) {
    return (i + 1).toString();
  }, // IDs must be strings for Ember Data
  name(i) {
    return `Mocked-Repo-${i + 1}`;
  },
  owner() {
    return { login: 'test-org' };
  }, // Ensure owner matches test
  description() {
    return 'A test repository';
  },
  html_url(i) {
    return `https://github.com/test-org/repo-${i + 1}`;
  },
  language(i) {
    return i % 2 === 0 ? 'JavaScript' : 'Python';
  }, // Alternate languages
  private(i) {
    return i % 2 === 0;
  }, // Alternate private status
  branches_url(i) {
    return `https://api.github.com/repos/test-org/repo-${i + 1}/branches{/branch}`;
  },
});
