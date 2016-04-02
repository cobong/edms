var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AuditSchema = new Schema({
	userName : {type: String, required:true},
	timeStamp : { type: Date, default: Date.now },
	comments : {type: String, required:true}
});

exports.model = mongoose.model('Audit',AuditSchema);