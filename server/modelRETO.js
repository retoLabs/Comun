var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var topolSchema = new Schema({ 
 meta : { type: {} },
 nodos: { type: [] },
});

module.exports = mongoose.model('topol', topolSchema);
