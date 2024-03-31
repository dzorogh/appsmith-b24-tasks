export default {
	formatDuration: (minutes, unit) => {
		return moment.utc(moment.duration(minutes, unit).asMilliseconds()).format("HH:mm")
	}
}