export default {

	mainDepartmentId: null,

	usersRaw: [],

	usersFormatted: [],

	tasksFinishedSum: 0,
	tasksUnfinishedSum: 0,

	fields: {
		ID: 'id',
		FIRST_NAME: 'firstName',
		LAST_NAME: 'lastName',
		FULL_NAME: 'fullName',
		TASKS_COUNT: 'tasksCount',
		FINISHED_TASKS_COUNT: 'finishedTasksCount',
		UNFINISHED_TASKS_COUNT: 'unfinishedTasksCount',
		TASKS_IN_SPRINT: 'tasksInSprint',
		ELAPSED_MINUTES: 'elapsedMinutes',
		ELAPSED_TIME: 'elapsedTime'
	},

	// async loadUsersCache() {
	// this.usersFormatted = Object.values(await MongoFindUsers.run());
	// 
	// const tasksData = await LoadTasksData.run();
	// 
	// this.tasksFinishedSum = tasksData?.tasksFinishedSum ?? 0;
	// this.tasksUnfinishedSum = tasksData?.tasksUnfinishedSum ?? 0;
	// },

	async reloadUsers() {
		const departmentIds = await this.getAllDepartmentsIds();

		this.usersRaw = await this.getAllUsersByDepartmentIds(departmentIds);

		this.formatUsers();
		// this.saveUsers();

		return this.usersRaw;
	},

	// async saveUsers() {
	// await MongoRemoveUsers.run({ids: this.usersFormatted.map(u => u.id)});
	// await MongoInsertUsers.run({users: this.usersFormatted});
	// 
	// // await SaveTasksData.run({
	// // tasksFinishedSum: this.tasksFinishedSum,
	// // tasksUnfinishedSum: this.tasksUnfinishedSum
	// // })
	// },

	// async saveUser(user) {
	// await SaveUser.run({ user })
	// },

	getAllDepartmentsIds: async () => {
		const headDepartmentResult = await getDepartmentByHead.run();
		const headDepartmentId = headDepartmentResult.result[0].ID;

		const subDepartmentsResult = await getDepartmentByParent.run({ parentId: headDepartmentId });
		const subDepartmentsIds = subDepartmentsResult.result.map(item => item.ID);

		const allDepartmentsIds = [headDepartmentId, ...subDepartmentsIds];

		return allDepartmentsIds;
	},

	async getAllUsersByDepartmentIds(ids) {
		let allUsers = []

		for await (const departmentId of ids) {
			const usersResult = await getUsersByDepartmentId.run({ departmentId });
			const users = usersResult.result.map(item => {
				return {
					[Users.fields.ID]: item.ID,
					[Users.fields.FIRST_NAME]: item.NAME,
					[Users.fields.LAST_NAME]: item.LAST_NAME,
					[Users.fields.FULL_NAME]: `${item.NAME} ${item.LAST_NAME}`
				}
			});

			//console.log(users);

			allUsers = [...allUsers, ...users];

		}

		return allUsers;
	},

	getFormattedUsers() {
		return this.usersRaw.map((user) => {
			const userTasks = Tasks.tasksFilterred.filter(task => task.responsibleId == user.id); 

			const userItems = ElapsedItems.elapsedItemsFiltered.filter(task => task.userId == user.id);

			const elapsedMinutes = userItems.reduce((accumulator, item) => {
				return accumulator + Number(item.minutes)
			}, 0);

			const elapsedTime = Util.formatDuration(elapsedMinutes, 'minutes');

			return {
				...user,
				[Users.fields.TASKS_COUNT]: userTasks.length,
				[Users.fields.FINISHED_TASKS_COUNT]: userTasks.filter(task => task.isFinished).length,
				[Users.fields.UNFINISHED_TASKS_COUNT]: userTasks.filter(task => !task.isFinished).length,
				[Users.fields.TASKS_IN_SPRINT]: userTasks.filter(task => task.addedToSprint).length,
				[Users.fields.ELAPSED_MINUTES]: elapsedMinutes,
				[Users.fields.ELAPSED_TIME]: elapsedTime,
			}
		});
	},

	formatUsers() {
		this.usersFormatted = this.getFormattedUsers();
		this.tasksFinishedSum = this.getTasksFinishedSum();
		this.tasksUnfinishedSum = this.getTasksUninishedSum();
	},

	onRowClick(id) {
		Tasks.filterByUser(id);
		ElapsedItems.filterByUser(id);
	},

	getTasksFinishedSum() {
		return this.usersFormatted.reduce((accumulator, item) => {
			return accumulator + Number(item.finishedTasksCount)
		}, 0);
	},

	getTasksUninishedSum() {
		return this.usersFormatted.reduce((accumulator, item) => {
			return accumulator + Number(item.unfinishedTasksCount)
		}, 0);
	}
}