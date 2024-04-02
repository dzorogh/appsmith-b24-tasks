export default {
	startDate: moment(new Date()).day('1').format('YYYY-MM-DD'),
	endDate: moment(new Date()).day('7').format('YYYY-MM-DD'),
	setStartDate: (value) => {
		this.startDate = value;
		this.endDate = moment(value).day('7').format('YYYY-MM-DD');
	},
	setEndDate: (value) => {
		this.endDate = moment(value).format('YYYY-MM-DD');
	},
	headUserId: 5393
}