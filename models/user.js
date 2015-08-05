//var mongodb = require('./db');
var mongodb = require('mongodb').Db;
var settings = require('../settings');
var crypto = require('crypto');

function User(user){
	this.name = user.name;
	this.password = user.password;
	this.email = user.email;
	this.friends = [];
}

module.exports = User;

User.prototype.save = function(callback){
	var md5 = crypto.createHash('md5');
	var email_MD5 = md5.update(this.email.toLowerCase()).digest('hex');
	var head = 'http://www.gravatar.com/avatar/' + email_MD5 + '?s=48';

	var user = {
		name: this.name,
		password: this.password,
		email: this.email,
		head: head
	};
	mongodb.connect(settings.url, function(err, db){
		if (err) {
			return callback(err);
		}
		db.collection('users', function(err, collection){
			if (err) {
				db.close();
				return callback(err);
			}
			collection.insert(user, {safe: true}, function(err, user){
				db.close();
				callback(null, user[0]);
			});
		});
	});
};

User.get = function(name, callback){
 mongodb.connect(settings.url, function(err, db){
 	if (err) {
 		return callback(err);
 	}
 	db.collection('users', function(err, collection){
 		if (err) {
 			db.close();
 			return callback(err);
 		}
 		collection.findOne({
 			name: name
 		}, function(err, user){
 			db.close();
 			if (user) {
 				return callback(null, user);
 			}
 			callback(err);
 		});
 	});
 });
};

User.getUserList = function(callback) {
	mongodb.connect(settings.url, function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('users', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}
			collection.find({}, {name: 1}).sort({
				'_id': -1
			}).toArray(function(err, user) {
				db.close();
				if (err) {
					callback(err);
				}
				if (user) {
					callback(null, user);
				}
			});
		});
	});
};

User.addFriend = function(options, callback) {
	mongodb.connect(settings.url, function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('users', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}
			collection.findOne({name: options.friend}, function(err, user) {
				if (err) {
					db.close();
					return callback(err);
				}
				if (user) {
					collection.update({name: options.name},{
						$push: {'friends': options.friend}
					}, function(err) {
						db.close();
						if (err) {
							callback(err);
						} else {
							callback(null, options.friend);
						}
					});
				} else {
					db.close();
					callback(null, 'no user');
				}
			});
		});
	});
};

User.getFriendList = function(options, callback) {
	var name = options.name;
	console.log('get friend list options is:', options);
	mongodb.connect(settings.url, function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('users', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}
			collection.findOne({name: options.name}, function(err, user) {
				console.log('friend list is:', user);
				db.close();
				if (err) {
					return callback(err);
				}
				callback(null, user.friends);
			});
		});
	});
};
