export default {
	loading: 0,

	async init() {
		this.loading = 1;
		Config.initialParams();
		this.loading = 10;
		await Users.reloadUsers();
		this.loading = 20;

		await Promise.all([
			Tasks.reloadTasks().then(() => this.loading += 40),
			ElapsedItems.reloadElapsedItems().then(() => this.loading += 40)
		]);

		this.loading = 100;

		setTimeout(() => {
			this.loading = 0;
		}, 500)
	}
}