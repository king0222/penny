var User = require('../models/user'),
	Post = require('../models/post'),
	crypto = require('crypto'),
	settings = require('../settings');
	url  = require("url"), 
    path = require("path"), 
	fs = require('fs'),
	httpHelper = require('../util/httpHelper');
/*
 * GET home page.
 */
module.exports = function(app) {
	app.get('/', function(req, res) {
		var page = (req.query && req.query.p) ? parseInt(req.query.p) : 1;
		Post.getPosts({
			name: null,
			page: page
		}, function(err, posts, total){
			if (err) {
				posts = [];
			}
			res.render('index', {
				title: 'F&K',
				posts: posts,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * settings.pageoffset + posts.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});


	app.get('/signup', function(req, res) {
		res.render('signup', {
			title: 'signup',
			error: req.flash('error').toString()
		});
	});
	app.post('/signup', function(req, res) {
		var name = req.body.name,
			password = req.body.password,
			password_re = req.body['password-repeat'];
		if (password_re != password) {
			req.flash('error', '两次输入的密码不一致！');

			return res.redirect('/signup');
		}
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('hex');
		var newuser = new User({
			name: req.body.name,
			password: password,
			email: req.body.email
		});
		User.get(newuser.name, function(err, user){
			if (user) {
				req.flash('error', '用户已经存在');
				return res.redirect('/signup');
			}
			newuser.save(function(err, user){
				if (err) {
					req.flash('error', err);
					return res.redirect('/signup');
				}
				req.session.user = user;
				res.cookie("user", req.body.name, {maxAge: 1000*60*60*24*30});
				req.flash('success', '注册成功！');
				res.redirect('/');
			});
		});
	});


	app.get('/login', function(req, res) {
		res.render('login', {
			title: 'login',
			error: req.flash('error').toString()
		});
	});
	app.post('/login', function(req, res) {
		var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.password).digest('hex');
		//检查用户是否存在
		User.get(req.body.name, function (err, user) {
			if (!user) {
			  req.flash('error', '用户不存在!'); 
			  return res.redirect('/login');//用户不存在则跳转到登录页
			}
			//检查密码是否一致
			if (user.password != password) {
			  req.flash('error', '密码错误!'); 
			  return res.redirect('/login');//密码错误则跳转到登录页
			}
			//用户名密码都匹配后，将用户信息存入 session
			res.cookie("user", req.body.name, {maxAge: 1000*60*60*24*30});
			req.session.user = user;
			req.flash('success', '登陆成功!');
			res.redirect('/');
		});
	});

	app.get('/signout', function(req, res) {
		req.session.user = null;
		req.flash('success', '登出成功!');
		res.redirect('/');
	});

	//所有的博客显示
	app.get('/post', function(req, res){
		Post.get(function(err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('posts', {
				title: '博客',
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString(),
				posts: posts
			});
		});		
	});
	//个人博客页面
	app.get('/post/:user', function(req, res){
		var page = req.query.p ? parseInt(req.query.p) : 1;
		User.get(req.session.user.name, function(err, user) {
			if (err) {
				req.flash('error', '用户不存在!');
				return res.redirect('/');
			}
			Post.getPosts({
				name: user.name,
				page: page
			}, function(err, posts, total) {
				if (err) {
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('posts', {
					title: user.name,
					posts: posts,
					page: page,
					isFirstPage: (page - 1) == 0,
					isLastPage: ((page - 1) * settings.pageoffset + posts.length) == total,
					user: req.session.user,
					success: req.flash('success').toString(),
					error: req.flash('error').toString()
				});
			});
		});		
	});

	//发表博客，发表成功后，转到自己的博客页面/post/:user
	app.post('/post', function(req, res){
		var name = req.session.user.name;
		var title = req.body.title;
		var content = req.body.content;
		var head = req.session.user.head;
		var tags = req.body.tags.split(' ');
		var tagsArr = [];
		if (tags.length > 1) {
			tags.forEach(function(tag, index) {
				var obj = {};
				obj.tag = tag;
				tagsArr.push(obj);
			});
		}
		
		var obj = {
			name: name,
			title: title,
			tags: tagsArr,
			content: content,
			head: head
		};
		var post = new Post(obj);
		post.save(function(err, post) {
			if (err) {
				req.flash('error', '发表文章出错');
				return;
			}
			req.flash('success', '发表文章成功');
			res.redirect('/post/'+req.session.user.name);
		});

	});

	//博客搜索
	app.get('/search', function(req, res) {
		var page = req.query.p ? parseInt(req.query.p) : 1;
		Post.search({
			keyword: req.query.keyword
		}, function(err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('posts', {
				title: 'search:' + req.query.keyword,
				posts: posts,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});

	app.get('/contact', function(req, res) {
		res.render('contact', {'title': '联系我'});
	});

	

	//当上面的访问路径都不存在时，则跳刀404页面
	app.use(function(req, res) {
	  res.render('404');
	});
	
	function checkLogin(req, res, next) {
		if (!req.session.user) {
			req.flash('error', '为登录');
			res.redirect('/login');
		}
		next();
	}
	function checkNotLogin(req, res, next) {
		if (req.session.user) {
			req.flash('error', '已登录');
			res.redirect('back');
		}
		next();
	}
};


