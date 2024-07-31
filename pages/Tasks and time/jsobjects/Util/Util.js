export default {
	formatDuration: (value, unit) => {
		const hours = 
					String(Math.floor(moment.duration(value, unit).asHours())).padStart(2, 0);
		const minutes = 
					String(moment.duration(value, unit).minutes()).padStart(2, 0);

		return `${hours}:${minutes}`;
	},
	
	changeTab: (tabObject, tab) => {
		tabObject.selectedTab = tab;
	},
}