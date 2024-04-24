export default {
	projectsRaw: [],

	//projectsFormatted: [],

	//projectsFilterred: [],

	filters: {

	},

	b24Fields: [

	],

	fields: {

	},

	async reloadProjects() {

		this.projectsRaw = (await getProjects.run()).result;

		return this.projectsRaw;
	},

	// formatProjects() {
	// this.projectsFormatted = this.getFormattedProjects();
	// },

	getFormattedProjects() {
		return this.projectsRaw.map((project) => {
			return {
				...project, 


			}
		});
	},

	onRowClick(projectId) {
		Tasks.filterByProject(projectId);
	},
}