export default {
	formatDuration: (value, unit) => {
		const hours = Math.floor(moment.duration(value, unit).asHours()); // get integer
		const minutes = moment.duration(value, unit).minutes();

		return `${hours}:${minutes}`;
	},
	changeTab: (tabObject, tab) => {
		tabObject.selectedTab = tab;
	}
}