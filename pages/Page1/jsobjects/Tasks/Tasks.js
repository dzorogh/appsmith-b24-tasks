export default {
	tasks: [],
	tasksFormatted: [],
	tasksFilterred: [],

	taskFields: [
		'ID', 
		'TITLE', 
		'PRIORITY', 
		'CREATED_BY',
		'RESPONSIBLE_ID',
		'CLOSED_DATE',
		'DURATION_PLAN',
		'DURATION_FACT',
		'DURATION_TYPE',
		'GROUP_ID',
		'STATUS',
		'CLOSED_DATE',
		'TIME_ESTIMATE',
		'UF_AUTO_231937255950', // Project
		'UF_AUTO_555825536710', // Company
		'UF_AUTO_692505608773', // Type
		'UF_AUTO_367625648403', // Приоритет
		'UF_AUTO_931265952655'  // дата добавления в спринт
	],

	get: async () => {
		this.tasks = []

		const usersIds = Users.users.map(u => u.id);

		console.log(usersIds);

		if (!usersIds.length) return [];

		await this.addFinishedTasks(usersIds)
		await this.addUnfinishedTasks(usersIds)

		this.formatAndFilterTasks();
		Users.aggregateTasks(this.tasksFormatted);

		console.log('Tasks', this.tasks, this.tasksFormatted);

		return this.tasks;
	},

	formatAndFilterTasks: () => {
		this.tasksFormatted = this.tasks.map((task) => {
			return {...task, ...{
				responsibleName: task.responsible.name,
				creatorName: task.creator.name,
				link: `https://crm.globaldrive.ru/company/personal/user/5393/tasks/task/view/${task.id}/`,
				factHours: Util.formatDuration(task.durationFact, 'minutes'),
				estimateHours: Util.formatDuration(task.timeEstimate, 'seconds'),
				isFinished: task.status == 4 || task.status == 5
			}};
		});

		this.tasksFilterred = this.tasksFormatted;
	},

	addFinishedTasks: async (userIds) => {
		console.log('addFinishedTasks', userIds)
		let next = 1

		do {
			const result = await getFinishedTasks.run({ next })

			next = result.next;

			const tasks = result.result.tasks;

			console.log('Finished tasks', tasks)

			this.tasks = [...this.tasks, ...tasks]

		} while (next);
	},

	addUnfinishedTasks: async ( userIds) => {
		console.log('addUnfinishedTasks', userIds)
		let next = 1

		do {
			const result = await getUnfinishedTasks.run({ next })

			next = result.next;

			const tasks = result.result.tasks;
			console.log('Unfinished tasks', tasks)

			this.tasks = [...this.tasks, ...tasks]

		} while (next);
	},

	filterByUser: (userId) => {
		this.tasksFilterred = this.tasksFormatted.filter(task => task.responsibleId == userId);
		console.log(TabsMain);
	},

	resetFilter: () => {
		this.tasksFilterred = this.tasksFormatted;
		TableUsers.setSelectedRowIndex(null);
	}
}