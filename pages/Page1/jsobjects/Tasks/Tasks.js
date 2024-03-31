export default {
	tasks: [],
	tasksFormatted: [],
	startDate: moment(new Date()).day('1').format('YYYY-MM-DD'),
	endDate: moment(new Date()).day('1').add('1', 'week').format('YYYY-MM-DD'),
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
	setStartDate: (value) => {
		this.startDate = value;
		this.endDate = moment(new Date()).add('1', 'week');
	},
	setEndDate: (value) => {
		this.endDate = value;
	},
	get: async (startDate, endDate) => {
		console.log('get', startDate, endDate);

		this.tasks = []

		const usersIds = Users.users.map(u => u.id);

		console.log(usersIds);

		if (!usersIds.length) return [];

		await this.addFinishedTasks(startDate, usersIds)
		await this.addUnfinishedTasks(startDate, endDate, usersIds)

		this.formatTasks();
		Users.aggregateTasks(this.tasksFormatted);

		console.log('Tasks', this.tasks, this.tasksFormatted);

		return this.tasks;
	},
	formatTasks: () => {
		this.tasksFormatted = this.tasks.map((task) => {
			return {...task, ...{
				responsibleName: task.responsible.name,
				creatorName: task.creator.name,
				link: `https://crm.globaldrive.ru/company/personal/user/5393/tasks/task/view/${task.id}/`,
				factHours: Util.formatDuration(task.durationFact, 'minutes'),
				estimateHours: Util.formatDuration(task.timeEstimate, 'seconds'),
				isFinished: task.status == 4 || task.status == 5
			}};
		})
	},
	addFinishedTasks: async (startDate, userIds) => {
		console.log('addFinishedTasks', startDate, userIds)
		let next = 1

		do {
			const result = await getFinishedTasks.run({ next })

			next = result.next;

			const tasks = result.result.tasks;

			console.log('Finished tasks', tasks)

			this.tasks = [...this.tasks, ...tasks]

		} while (next);
	},
	addUnfinishedTasks: async (startDate, endDate, userIds) => {
		console.log('addUnfinishedTasks', startDate, endDate, userIds)
		let next = 1

		do {
			const result = await getUnfinishedTasks.run({ next })

			next = result.next;

			const tasks = result.result.tasks;
			console.log('Unfinished tasks', tasks)

			this.tasks = [...this.tasks, ...tasks]

		} while (next);
	}
}