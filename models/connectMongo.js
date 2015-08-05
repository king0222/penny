module.exports = {
	createConnect: function(mongodb,settings) {
		if (settings.isproduct) {
			mongodb.connect(settings.url, function(err, db) {

			});
			
		} else {
			mongodb.open(function(err, db) {

			});
		}
	}
};
var connect = require('./connectmongo');
var connect = connect.createConnect(mongodb, settings);

