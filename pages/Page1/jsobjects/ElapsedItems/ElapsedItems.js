export default {
	elapsedItems: [],
	elapsedItemsFormatted: [],
	perPage: 50,
	get: async () => {
		this.elapsedItems = [];
		this.elapsedItemsFormatted = [];

		let nextPage = 1;

		do {
			const response = await getElapsedItems.run({ page: nextPage })

			if (response.next) {
				nextPage += 1;
			} else {
				nextPage = null;
			}

			const elapsedItems = response.result;

			console.log('elapsedItems', elapsedItems)

			this.elapsedItems = [...this.elapsedItems, ...elapsedItems]

		} while (nextPage);

		this.elapsedItemsFormatted = this.elapsedItems.map(item => ({
			id: item.ID,
			taskId: item.TASK_ID,
			userId: item.USER_ID,
			comment: item.COMMENT_TEXT,
			minutes: item.MINUTES,
			createdAt: item.CREATED_DATE,
			startAt: item.DATE_START,
			stopAt: item.DATE_STOP,
		}));

		Users.aggregateElapsedItems(this.elapsedItemsFormatted);
		
		return this.elapsedItemsFormatted;
	}
}