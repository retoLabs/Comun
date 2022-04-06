'use strict';

module.exports = function(app) {
	var Datos = require('./controllerRETO');

//------------------------------------------------------------------- Index - Route
	app.route('/')
		.get(Datos.get_Raiz);

//------------------------------------------------------------------- Shell Scripts
	app.route('/shell/mysql/')
		.post(Datos.SQL_MySQL);

	app.route('/shell/oracle/')
		.post(Datos.SQL_Oracle);

	app.route('/shell/sqlite/')
		.post(Datos.SQL_SQLite);

	app.route('/shell/cypher/')
		.post(Datos.Cypher);

	app.route('/shell/encript/')
		.post(Datos.encriptPWD);

	app.route('/shell/clima/')
		.post(Datos.getClima);

//------------------------------------------------------------------- MongoDB
	app.route('/datos/') 
		.get(Datos.findAll)
		.post(Datos.add);

	app.route('/metas/:iam') 
		.get(Datos.findMetas);

	app.route('/metasByOrg/:iam/:org') 
		.get(Datos.findMetasByOrg);

	app.route('/datos/:id') 
		.get(Datos.findById)
		.put(Datos.update)
		.delete(Datos.delete);

	app.route('/clone/:id') 
		.delete(Datos.duplica);

};





