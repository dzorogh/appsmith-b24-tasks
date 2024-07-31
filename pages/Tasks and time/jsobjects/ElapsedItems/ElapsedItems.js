export default {
	isLoading: false,
	elapsedItemsRaw: [],
	elapsedItemsFormatted: [],
	elapsedItemsFiltered: [],
	perPage: 50,
	filters: {

	},

	reloadElapsedItems: async () => {
		this.resetFilters();

		await this.getElapsedItems();

		this.formatElapsedItems();
		this.filterElapsedItems();
		// this.saveElapsedItems();

		await Users.formatUsers();

		return this.elapsedItemsRaw;
	},



	async getElapsedItems() {
		this.elapsedItemsRaw = [];
		let nextPage = 1;

		do {
			const response = await getElapsedItems.run({ page: nextPage })

			if (response.next) {
				nextPage += 1;
			} else {
				nextPage = null;
			}

			const elapsedItems = response.result; 

			this.elapsedItemsRaw = [...elapsedItems, ...this.elapsedItemsRaw]

		} while (nextPage);

		return this.elapsedItemsRaw;
	},



	formatElapsedItems() {
		this.elapsedItemsFormatted = this.getFormattedElapsedItems();

		return this.elapsedItemsFormatted;
	},

	filterElapsedItems() {
		this.elapsedItemsFiltered = this.getFilteredElapsedItems();

		return this.elapsedItemsFiltered;
	},

	// async saveElapsedItem(elapsedItem) {
	// await SaveElapsedItem.run({ elapsedItem })
	// },
	// 
	// async saveElapsedItems() {
	// for await (const elapsedItem of this.elapsedItemsFormatted) {
	// await this.saveElapsedItem(elapsedItem)
	// }
	// },

	getFormattedElapsedItems() {
		return this.elapsedItemsRaw.map(item => ({
			id: item.ID,
			taskId: item.TASK_ID,
			userId: item.USER_ID,
			comment: item.COMMENT_TEXT,
			minutes: item.MINUTES,
			createdAt: item.CREATED_DATE,
			startAt: item.DATE_START,
			stopAt: item.DATE_STOP,

			userFullName: Users.usersFormatted.find(u => u.id == item.USER_ID)?.fullName,
			taskTitle: Tasks.tasksFormatted.find(t => t.id == item.TASK_ID)?.title,
			taskUrl: `https://crm.globaldrive.ru/company/personal/user/5393/tasks/task/view/${item.TASK_ID}/`, 
		}));
	},
	// 
	// filterByDateCallback(item) {
	// return (
	// moment(item.startAt).isSameOrAfter(Config.startDate) &&
	// moment(item.startAt).isSameOrBefore(Config.endDate)
	// )
	// },

	getFilteredElapsedItems() {
		return this.elapsedItemsFormatted.filter((item) => {
			const checks = [];

			if (this.filters.userId) {
				checks.push(item.userId == this.filters.userId);
			}

			if (this.filters.taskId) {
				checks.push(item.taskId == this.filters.taskId);
			}

			return checks.every(c => c)
		});
	},

	filterByTask(taskId) {
		this.filters.taskId = taskId;

		this.filterElapsedItems();
	},

	filterByUser(userId) {
		this.filters.userId = userId;

		this.filterElapsedItems();
	},

	resetFilters() {
		this.filters = {};

		this.filterElapsedItems();
	},

}