// serverRETO.js
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
//var cors = require('cors');

//const favicon = require('express-favicon');

var fs = require('fs');
var util = require('util');

var app = express();

var _appRETO = process.argv[2]
var _bddRETO = process.argv[3]
var portRETO = process.argv[4]

//------------------------------------------------------------------- Directories
app.use("/", express.static("./apps/"+_appRETO+"/html"));
app.use("/img", express.static("./apps/"+_appRETO+"/img"));
app.use("/lib", express.static("./Comun/libs"));
app.use("/k1", express.static("./Comun/kernel"));
app.use("/fonts", express.static("./Comun/fonts"));


// Nota : __dirname = /home/reto/v2RETO/Comun/server
//------------------------------------------------------------------- C O R S
app.use(function (req, res, next) {

	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', 'http://marigold.es');

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);

	// Pass to next layer of middleware
	next();
});

//------------------------------------------------------------------- Connection to DB
mongoose.connect(
	'mongodb://localhost/'+_bddRETO, 
	{ 
		useNewUrlParser: true,
		useUnifiedTopology: true
	}, 
	function(err, res) {
		if(err) throw err;
		console.log('Connected to Database');
	}
);

// Middlewares
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 
app.use(methodOverride());
// app.get('/favicon.ico', (req, res) => res.status(204).end());
// Import Models, Controllers and Routes

var models = require('./modelRETO');
var control = require('./controllerRETO');
var router = require('./routesRETO');
router(app); //register the route

//------------------------------------------------------------------- Start server
app.listen(parseInt(portRETO), function() {
	console.log("App "+_appRETO+" en http://localhost:"+portRETO);
});

//------------------------------------------------------------------- Debug log
var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debugNodeRETO.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

