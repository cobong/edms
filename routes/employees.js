var express = require('express');
var router = express.Router();

var EmployeeModel = require('../models/employeeModel');
var Employee = EmployeeModel.EmployeeModel;

router.get('/dashboard', function(req, res, next) {
	Employee.find(function(err, employees) {
		if (err)
			res.send(err)
		//res.json(employees);
		console.log(JSON.stringify(employees));
		res.render('dashboard',{emps:employees,title:'Employee Dashboard'});
	});
});

router.post('/dashboard', function(req, res, next) {
	Employee.find({ $or:[ {'firstName':req.body.filter}, {'lastName':req.body.filter} ]},function(err, employees) {
		if (err)
			res.send(err)
		console.log(JSON.stringify(employees));
		res.render('dashboard',{emps:employees,title:'Employee Dashboard'});
	});
});
router.get('/register', function(req, res, next) {
	res.render('register',{title:'Employee Registration'});
});

router.post('/register', function(req, res, next) {
	Employee.create({
		userName : req.body.userName,
		firstName : req.body.firstName,
		lastName : req.body.lastName,
		email : req.body.email,
		password : req.body.password
		}, function(err, employee) {
			if (err)
                res.send(err);
            res.redirect('/employees/dashboard');
		});
});

router.get('/login', function(req, res, next) {
	res.render('login',{title:'Employee Login'});
});

router.post('/login', function(req, res, next) {
	Employee.findOne({
		userName : req.body.userName,
		password : req.body.password
		}, function(err, employee) {
			if (err || !employee)
                res.render('login',{title:'Employee Login',msg:'Please check your username/password'});
            else
                res.redirect('/employees/dashboard');
		});
});

router.get('/delete/:userName', function(req, res, next) {
	Employee.remove({
		userName : req.params.userName,
		}, function(err, employee) {
			if (err)
                res.send(err);
            res.redirect('/employees/dashboard');
			// get and return all the todos after you create another
		});
});

module.exports = router;
