export default {
	headUserId: 5393,

	startDate: null,
	endDate: null,

	initialParams() {
		moment.updateLocale("en", { week: {
			dow: 1, // First day of week is Monday
			doy: 4  // First week of year must contain 4 January (7 + 1 - 4)
		}});

		this.startDate = moment(new Date()).startOf('week').format('YYYY-MM-DD');
		this.endDate = moment(new Date()).endOf('week').format('YYYY-MM-DD')
	},

	async setStartDate(value) {
		this.startDate = value;
		this.endDate = moment(value).day('7').format('YYYY-MM-DD');
		// this.saveConfig();

		await PageController.init()
	},

	async setEndDate(value) {
		this.endDate = moment(value).format('YYYY-MM-DD');
		// this.saveConfig();

		await PageController.init()
	},


	// async saveConfig() {
	// await SaveConfig.run();
	// },

	// async loadConfig() {
	// const result = await LoadConfig.run();
	// if (result.startDate) {
	// this.startDate = result.startDate
	// }
	// if (result.endDate) {
	// this.endDate = result.endDate
	// }
	// }
}