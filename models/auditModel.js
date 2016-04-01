var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AuditSchema = new Schema({
	userName : {type: String, required:true},
	timeStamp : {type: Date, required:true},
	comments : {type: String, required:true}
});

exports.AuditModel = mongoose.model('Audit',AuditSchema);