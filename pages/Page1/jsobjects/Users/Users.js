export default {
	headUserId: 5393,
	mainDepartmentId: null,

	users: [],

	get: async () => {
		const departmentIds = await this.getAllDepartmentsIds();

		console.log(departmentIds);

		const users = await this.getAllUsersByDepartmentIds(departmentIds);

		this.users = users;

		return users;
	},

	getAllDepartmentsIds: async () => {
		const headDepartmentResult = await getDepartmentByHead.run();
		const headDepartmentId = headDepartmentResult.result[0].ID;

		const subDepartmentsResult = await getDepartmentByParent.run({ parentId: headDepartmentId });
		const subDepartmentsIds = subDepartmentsResult.result.map(item => item.ID);

		const allDepartmentsIds = [headDepartmentId, ...subDepartmentsIds];

		return allDepartmentsIds;
	},

	getAllUsersByDepartmentIds: async (ids) => {
		let allUsers = []


		for await (const departmentId of ids) {
			const usersResult = await getUsersByDepartmentId.run({ departmentId });
			const users = usersResult.result.map(item => {
				return {
					id: item.ID,
					firstName: item.NAME,
					lastName: item.LAST_NAME,
					fullName: `${item.NAME} ${item.LAST_NAME}`
				}
			});

			//console.log(users);

			allUsers = [...allUsers, ...users];

		}

		return allUsers;
	},

	aggregateTasks(tasks) {
		this.users = this.users.map((user) => {
			const userTasks = tasks.filter(task => task.responsibleId == user.id); 

			return {
				...user,
				tasksCount: userTasks.length,
				finishedTasksCount: userTasks.filter(task => task.isFinished).length,
				unfinishedTasksCount: userTasks.filter(task => !task.isFinished).length
			}
		});
	}
}