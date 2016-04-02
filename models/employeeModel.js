var mongoose = require('mongoose');
var EmployeeSchema = mongoose.Schema({
	userName : {type: String, required:true, unique:true},
	firstName : {type: String, required:true},
	lastName : {type: String, required:true},
	email	: {type: String, required:true},
	password : {type: String, required:true}
});

exports.model = mongoose.model('Employee',EmployeeSchema);