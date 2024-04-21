export default {
	tasksRaw: [],

	tasksFormatted: [],

	tasksFilterred: [],

	filters: {

	},

	b24Fields: [
		'ID', 
		'TITLE', 
		'PRIORITY', 
		'CREATED_BY',
		'RESPONSIBLE_ID',
		'DURATION_PLAN',
		'DURATION_FACT',
		'DURATION_TYPE',
		'GROUP_ID',
		'STATUS',
		'CLOSED_DATE',
		'CREATED_DATE',
		'TIME_ESTIMATE',
		'UF_AUTO_231937255950', // Project
		'UF_AUTO_555825536710', // Company
		'UF_AUTO_692505608773', // Type
		'UF_AUTO_367625648403', // Приоритет
		'UF_AUTO_931265952655'  // дата добавления в спринт
	],

	fields: {
		ID: 'id',
		CREATOR: 'creator',
		RESPONSIBLE: 'responsible',
		RESPONSIBLE_ID: 'responsibleId',
		DURATION_FACT: 'durationFact',
		TIME_ESTIMATE: 'timeEstimate',
		RESPONSIBLE_NAME: 'responsibleName',
		CREATOR_NAME: 'creatorName',
		LINK: 'link',
		FACT_HOURS: 'factHours',
		ESTIMATE_HOURS: 'estimateHours',
		IS_FINISHED: 'isFinished',
		UF_ADDED_TO_SPRINT: 'ufAuto931265952655',
		ADDED_TO_SPRINT_AT: 'addedToSprintAt',
		ADDED_TO_SPRINT_WEEKS_AGO: 'addedToSprintWeeksAgo',
		STATUS: 'status',
	},

	// async loadTasksCache() {
	// this.tasksFormatted = Object.values(await MongoFindTasks.run());
	// },

	async reloadTasks() {
		this.resetFilters();
		this.tasksRaw = []

		await this.addFinishedTasks();
		await this.addUnfinishedTasks();

		this.formatTasks();
		this.filterTasks();
		//await this.saveTasks();

		await Users.reloadUsers();

		return this.tasksRaw;
	},

	// async saveTask(task) {
	// await MongoUpsertTask.run({task});
	// },

	// async saveTasks() {
	// await MongoRemoveTasks.run({ids: this.tasksFormatted.map(t => t.id)});
	// //await MongoInsertTasks.run({tasks: this.tasksFormatted});
	// const promises = [];
	// 
	// for (const task of this.tasksFormatted) {
	// promises.push(this.saveTask(task));
	// }
	// 
	// await Promise.all(promises);
	// },

	formatTasks() {
		this.tasksFormatted = this.getFormattedTasks();
	},

	getFormattedTasks() {
		return this.tasksRaw.map((task) => {
			return {
				...task, 

				[Tasks.fields.ID]: task[this.fields.ID],
				[Tasks.fields.RESPONSIBLE_NAME]: task[this.fields.RESPONSIBLE]?.name,
				[Tasks.fields.CREATOR_NAME]: task[this.fields.CREATOR]?.name,
				[Tasks.fields.LINK]: `https://crm.globaldrive.ru/company/personal/user/5393/tasks/task/view/${task[this.fields.ID]}/`,
				[Tasks.fields.FACT_HOURS]: Util.formatDuration(task[this.fields.DURATION_FACT], 'minutes'),
				[Tasks.fields.ESTIMATE_HOURS]: Util.formatDuration(task[this.fields.TIME_ESTIMATE], 'seconds'),
				[Tasks.fields.IS_FINISHED]: task[this.fields.STATUS] == 4 || task[this.fields.STATUS] == 5,
				[Tasks.fields.ADDED_TO_SPRINT_AT]: task[this.fields.UF_ADDED_TO_SPRINT],
				[Tasks.fields.ADDED_TO_SPRINT_WEEKS_AGO]: moment(task[Tasks.fields.UF_ADDED_TO_SPRINT]).diff(new Date(), 'w'),
			}
		});
	},

	addFinishedTasks: async () => {
		//console.log('addFinishedTasks', userIds)
		let next = 1

		do {
			const result = await getFinishedTasks.run({ next })

			next = result.next;

			const tasks = result.result.tasks;

			console.log('Finished tasks', tasks)

			this.tasksRaw = [...this.tasksRaw, ...tasks]

		} while (next);
	},

	addUnfinishedTasks: async () => {
		//console.log('addUnfinishedTasks', userIds)
		let next = 1

		do {
			const result = await getUnfinishedTasks.run({ next })

			next = result.next;

			const tasks = result.result.tasks;
			console.log('Unfinished tasks', tasks)

			this.tasksRaw = [...this.tasksRaw, ...tasks]

		} while (next);
	},

	filterTasks() {
		this.tasksFilterred = this.getFilterredTasks();
	},

	filterByUser(userId)  {
		this.filters.responsibleId = userId;
		this.filterTasks();
	},

	resetFilters() {
		this.filters = {};
		TableUsers.setSelectedRowIndex(null);
		this.filterTasks();
	},

	onRowClick(taskId) {
		ElapsedItems.filterByTask(taskId);
	},
// 
	// filterByDateCallback(task) {
		// return (
			// // finished tasks 
			// (moment(task.closedDate).isSameOrBefore(Config.endDate) && moment(task.closedDate).isSameOrAfter(Config.startDate) && task.status >= 4) || 
// 
			// // unfinished tasks 
			// (moment(task.createdDate).isSameOrBefore(Config.endDate) && task.status <= 3)
		// )
	// },

	getFilterredTasks() {

		return this.tasksFormatted.filter((task) => {
			const checks = [];

			//checks.push(this.filterByDateCallback(task)); 

			if (this.filters.responsibleId) {
				checks.push(task[this.fields.RESPONSIBLE_ID] == this.filters.responsibleId);
			}

			return checks.every(c => c)
		});
	}
}