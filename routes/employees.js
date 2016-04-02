var express = require('express');
var colors = require('colors');
var router = express.Router();
var fs = require('fs');

var EmployeeModel = require('../models/employeeModel');
var Employee = EmployeeModel.model;

var AuditModel = require('../models/auditModel');
var Audit = AuditModel.model;

function audit(user,comments){
    Audit.create({
        userName:user.userName,
        comments:comments
        }, function(err, audit) {
            if (err)
                console.log(err.red);
            else
                console.log('AUDIT: '.green +" : ".yellow+ audit.timeStamp.toISOString().cyan + " : ".yellow +user.userName.cyan+" : ".yellow+comments.cyan);
        });
}

router.get('/audit', function(req, res, next) {
    if(req.session.user==null)
        res.redirect('/employees/login');
	Audit.find(function(err, entries) {
		if (err)
			res.send(err)
        else
            res.render('audit',{entries:entries,title:'Employee Audit',user:req.session.user,admin:req.session.admin});
	});
});

router.get('/dashboard', function(req, res, next) {
    if(req.session.user==null)
        res.redirect('/employees/login');
	Employee.find({userName:{'$ne':'admin'}},function(err, employees) {
		if (err)
			res.send(err);
        else
            res.render('dashboard',{emps:employees,title:'Employee Dashboard',user:req.session.user,admin:req.session.admin});
	});
});

router.post('/dashboard', function(req, res, next) {
	Employee.find({ $or:[ {'firstName':req.body.filter}, {'lastName':req.body.filter} ]},function(err, employees) {
		if (err)
			res.send(err)
        else
            res.render('dashboard',{emps:employees,title:'Employee Dashboard'});
	});
});

router.get('/register', function(req, res, next) {
	res.render('register',{title:'Employee Registration'});
});

router.post('/register', function(req, res, next) {
    var user={
        userName:req.body.userName,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email
        }
    if(req.body.password==req.body.cpassword){
        user.password=req.body.password;
        Employee.create(user, function(err, employee) {
                if (err)
                    res.send(err);
                else{
                    delete employee['password']
                    req.session.user=employee;  
                    audit(req.session.user,'Registered');
                    res.redirect('/employees/dashboard');
                }
            });
    }
    else{
        res.render('register',{title:'Employee Registration',msg:"Passwords do not match",user:user});
    }
});

router.get('/login', function(req, res, next) {
	res.render('login',{title:'Employee Login'});
});

router.post('/login', function(req, res, next) {
    var userName=req.body.userName;
    var password=req.body.password;
	Employee.findOne({
		userName : userName,
		password : password
		}, function(err, employee) {
			if (err || !employee)
                res.render('login',{title:'Employee Login',msg:'Invalid username/password'});
            else{
                delete employee['password']
                req.session.user=employee;
                if(employee.userName=='admin')
                  req.session.admin=true;
                audit(req.session.user,'Loggeded in');
                res.redirect('/employees/dashboard');
            }
		});
});

router.get('/logout', function(req, res, next) {
    req.session.destroy();
	res.redirect('/employees/login');
});

router.get('/delete/:userName', function(req, res, next) {
    if(req.session.user==null)
        res.redirect('/employees/login');
	Employee.remove({
		userName : req.params.userName,
		}, function(err, employee) {
			if (err)
                res.send(err);
            else{
                audit(req.session.user,'Deleted user - '+req.params.userName);
                res.redirect('/employees/dashboard');
            }
		});
});

router.get('/passwd', function(req, res, next) {
    if(req.session.user==null)
        res.redirect('/employees/login');
    else
        res.render('passwd',{title:'Employee Password Change',user:req.session.user,admin:req.session.admin});
});

router.post('/passwd', function(req, res, next) {
    var oldPass = req.body.opassword;
    var newPass = req.body.password;
    var confPass = req.body.cpassword;

	Employee.findOne({
		userName : req.body.userName,
		password : oldPass
		}, function(err, employee) {
			if (err)
                res.render('passwd',{title:'Employee Password Change',msg:err,user:req.session.user});
            else if(!employee)
                res.render('passwd',{title:'Employee Password Change',msg:'Incorrect old password',user:req.session.user,admin:req.session.admin});
            else{
                if( newPass==confPass)
                    Employee.update({
                        userName : req.body.userName,
                        password : oldPass
                        },
                        { password:newPass },
                        function(err, employee) {
                            if (err || !employee)
                                res.render('passwd',{title:'Employee Password Change',msg:'Password change failed',user:req.session.user,admin:req.session.admin});
                            else{ 
                                audit(req.session.user,'Password changed');
                                res.render('passwd',{title:'Employee Password Change',msg:'Password change success',user:req.session.user,admin:req.session.admin});
                            }
                        });
            }
		});
});

router.get('/edit', function(req, res, next) {
    if(req.session.user==null)
        res.redirect('/employees/login');
    else
        res.render('profile',{action:'Edit',title:'Employee Profile',user:req.session.user,admin:req.session.admin});
});

router.get('/view', function(req, res, next) {
    if(req.session.user==null)
        res.redirect('/employees/login');
    else
        res.render('profile',{action:'View',title:'Employee Profile',user:req.session.user,admin:req.session.admin});
});

router.get('/edit/:userName', function(req, res, next) {
    if(req.session.user==null)
        res.redirect('/employees/login');
    else{
        Employee.findOne({userName:req.params.userName},function(err, employee) {
            if (err)
                res.send(err);
            else
                res.render('profile',{action:'Edit',title:'Employee Profile',user:employee,admin:req.session.admin});
        });
    }
});

router.post('/edit', function(req, res, next) {
    var user={
        userName:req.body.userName,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email
        };
    Employee.update({userName:user.userName},
        {$set:{firstName:user.firstName,
            lastName:user.lastName,
            email:user.email}}, 
            function(err, employee) {
                if (err)
                    res.send(err);
                else{
                    Employee.findOne({userName:req.session.user.userName},
                        function(err, employee) {
                            audit(req.session.user,'Profile updated '+user.userName);
                            res.redirect('/employees/dashboard');
                    });
                }
            });
});


router.get('/upload', function(req, res, next) {
    if(req.session.user==null)
        res.redirect('/employees/login');
    else if(!req.session.admin)
        res.redirect('/employees/dashboard');
    else
        res.render('upload',{title:'Bulk Upload',user:req.session.user,admin:req.session.admin});
});

router.post('/upload', function(req, res, next) {
    fs.readFile(req.files.bulkFile.path, function (err, data) {
        var Converter = require("csvtojson").Converter;
        var converter = new Converter({});
        converter.fromString(data.toString(), function(err,result){
            result.forEach(function(user) {  
                Employee.create(user, function(err, employee) {
                    if (err)
                        res.send(err);
                    else
                        audit(req.session.user,'Upload : '+ employee.userName);
                });
            });
            res.redirect('/employees/dashboard');
        });
    });
});


router.use('/*',function(req, res, next) {
    if(req.session.user==null)
        res.redirect('/employees/login');
    else    
        res.redirect('/employees/dashboard');
});


module.exports = router;

