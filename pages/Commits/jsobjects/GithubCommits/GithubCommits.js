export default {
	startDate: "",
	endDate: "",
	_page: 1,
	_repo: "",
	_ref: "",
	users: [],
	repos: [],
	commits: [],
	commitsFormatted: [],
	authors: [],
	initialParams() {
		moment.updateLocale("en", { week: {
			dow: 1, // First day of week is Monday
			doy: 4  // First week of year must contain 4 January (7 + 1 - 4)
		}});

		if (!this.startDate) {
			this.startDate = moment(new Date()).startOf('week').format('YYYY-MM-DD');
		}

		if (!this.endDate) {
			this.endDate = moment(new Date()).endOf('week').format('YYYY-MM-DD')
		}

	},
	async setStartDate(value) {
		this.startDate = value;
		this.endDate = moment(value).day('7').format('YYYY-MM-DD');
		// this.saveConfig();

		//await PageController.init()
	},

	async setEndDate(value) {
		this.endDate = value;
		// this.saveConfig();

		//await PageController.init()
	},
	async getRepos() {
		const result = await GithubApiRepos.run();

		this.repos = result;
	},
	async getCommits() {
		this._page = 1;

		const loadRecursive = async () => {
			const commits = await GithubApiCommits.run();

			console.log('Commits', commits);

			for await (const commit of commits) {
				this._ref = commit.sha;

				await this.getCommitData();
			}

			if (commits.length) {
				this._page += 1;

				console.log('Load next page', this._page)

				await loadRecursive();
			}
		}

		await loadRecursive();
	},
	async getCommitData() {
		const commit = await GithubApiCommitByRef.run();

		this.commits.push(commit);
	},
	async formatCommits() {
		this.commitsFormatted = this.commits.map((c) => {
			return {
				message: c.commit.message,
				url: c.html_url,
				additions: c.stats && c.stats.additions ? c.stats.additions : 0,
				deletions: c.stats && c.stats.deletions ? c.stats.deletions : 0,
				createdAt: c.commit && c.commit.committer ? c.commit.committer.date : null,
				authorEmail: c.commit && c.commit.author ? c.commit.author.email : "",
				authorName: c.commit && c.commit.author ? c.commit.author.name : ""
			}
		})
	},
	async groupByAuthor() {
		this.authors = [];
		const authorsByEmail = {}

		this.commitsFormatted.forEach((commit) => {
			console.log(commit);
			
			if (!authorsByEmail[commit.authorEmail]) {
				authorsByEmail[commit.authorEmail] = {
					authorEmail: commit.authorEmail,
					authorName: commit.authorName,
					count: 0,
					additions: 0,
					deletions: 0
				}
			}

			authorsByEmail[commit.authorEmail].additions += commit.additions;
			authorsByEmail[commit.authorEmail].deletions += commit.deletions;
			authorsByEmail[commit.authorEmail].count += 1;
		});

		console.log(authorsByEmail);

		this.authors = [...this.authors, ... Object.values(authorsByEmail)]
	},
	async getData() {
		this._page = 1;
		this._ref = "";
		this.repos = [];
		this.commits = [];

		await this.getRepos();

		for await (const repo of this.repos) {
			this._repo = repo.name;

			console.log(this._repo);

			await this.getCommits();
		}

		await this.formatCommits();
		await this.groupByAuthor(); 
	},
}