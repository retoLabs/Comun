//------------------------------------------------------------------- Class Ids
// Genera enteros de {prec} dígitos + la serie
// Ej : new rIds(6,1) --> 1xxxxxx
// Ej : new rIds(4,3) --> 3xxxx

class rIds {
	constructor(prec,serie){
		this.prec = prec || 6;
		this.serie = serie || 1;
	}

	getId(){
		var base = 1;
		for (var i=0;i<this.prec;i++) base *= 10; // 10 ^ prec
		return Math.floor(Math.random()*base + this.serie*base);
	}
}
//-------------------------------------------------------------------Variables globales
export var vgk = {
 	laZ : 0, 			// para manejar zIndex en nodos Drag	
	idsNodo : new rIds(6,1), // generador de id0's para nodos;
	idsSess : new rIds(9,1), // generador de id0's para sesiones;
	MSGAP : Date.parse('01 Jan 2000 00:00:00 GMT'), // GAP entre Unix y RETO (milisegundos)
	GRANO : 300000, 		// 5 min * 60 * 1000 ms
	UNDIA : 288   //  1 dia = 12 granos/h * 24 horas
}

//------------------------------------------------------------------- Params HTML
function getParamsHTML(){
	var campo;
	var laURL = document.URL;
	var strParams = laURL.substring(laURL.indexOf('?')+1,laURL.length);
	var trozos = strParams.split('&');
	var params = {};
	trozos.map(function(trozo){
		campo = trozo.split('=');
		params[campo[0]] = campo[1];
	});
	return params;
}

//------------------------------------------------------------------- Utils
function r$(id){return document.getElementById(id);}

function rEl$(tipo,attr){
	var elem = document.createElement(tipo);
	if (attr && attr.id) elem.setAttribute('id',attr.id);
	if (attr && attr.type) elem.setAttribute('type',attr.type);
	if (attr && attr.name) elem.setAttribute('name',attr.name);
//	console.log(elem.tagName+':'+elem.id);
	return elem;
}

function rRev(arr){
	return arr.slice().reverse();
}



function rInitCap(str) {
   return str.toLowerCase().replace(/(?:^|\s)[a-z]/g, function (m) {
      return m.toUpperCase();
   	});
}

/* Pendiente implementación
function validaNodo(nodo){
	var valid = nodo.valid();// objeto con reglas validación
	var keys = valid.keys();
	keys.map(function(key){
		if (!nodo[key].match(valid[key])) return key;
	})
	return'OK';
}
*/
//------------------------------------------------------------------- CSV a OBJ
// Recibe dos string, uno con las claves y otro con valores
// Ej. claves : cod|nom|mail
// Ej. valores : PEPE|Jose Maria|pepe.at.reto-labs.es
// --> Obj({cod:"PEPE",nom:"Jose Maria",mail:"pepe.at.reto-labs.es"})
function csv2obj (caps,pstr){
	var valor;
	if (pstr.length == 0) return false;
	var claves = caps.split('|');		
	var values = pstr.split('|');	
	if (claves.length != values.length){return false;}

	var obj = {};
	claves.map(function(clave,ix){
		valor = values[ix];
		obj[clave] = valor;
	});

	return obj;
}

function csv2filas(csv){
	var filas = [];

	var lins = csv.split('\n');
	var linErr = lins.splice(-2,1);
	if (linErr != '[error:0]') {console.log('Error BD !'); return filas }
	else if (lins.length < 2) return filas;

	var caps = (lins.splice(0,1)[0]).toLowerCase();
	var kaps = [];
	caps.split('|').map(function(kap){
		kaps.push(kap.trim());
	})
	
	caps = kaps.join('|');

	lins.map(function(lin){
		var fila = csv2obj(caps,lin);
		if (fila) filas.push(fila);
	})
	
	return filas;
}

//------------------------------------------------------------------- Objeto a string
function o2s(obj){
	return JSON.stringify(obj);
}

function s2o(obj){ 
	return JSON.parse(obj);
}

function rMsg(msg){
	alert(msg);
}

function rEncripta(texto,frase){
	var nT = texto.length;
	var nF = frase.length;
	var result = '';
	 
	for (var i=0;i<nT;i++){
		var orChars = texto.charCodeAt(i) ^ frase.charCodeAt(i % nF);
		result += String.fromCharCode(orChars);
	}
	return result;
}

function clonaClase(clase){
	var clon = eval('new '+clase.iam+'()');
	clon.objDB2Clase(clase);
	return clon;
}

function inputOK(formato,texto){
	var regexp = null;
	switch (formato){
		case 'TAG':
			regexp = new RegExp(/^[A-z0-9-_ ]{3,25}$/);
			break;
		case 'COD':
			regexp = new RegExp(/^[A-Z0-9-_.]{2,15}$/);
			break;
		case 'DSC':
			regexp = new RegExp(/^[A-z0-9-_ .:;]{2,150}$/);
			break;
		case 'INT':
			regexp = new RegExp(/^\+?(0|[1-9]\d*)$/);
			break;
		case 'DEC':
			regexp = new RegExp(/^\d+\.\d{0,8}$/);
			break;
		case 'IMG':
			regexp = new RegExp(/^([A-z0-9-_]+\/)*([A-z0-9-_]+\.(gif|jpg|jpeg|tiff|png))$/);
			break;
	
	}

	console.log(formato+' | '+texto+' : '+regexp.test(texto));
	if (regexp) return regexp.test(texto);
	else return true;
}
export default {vgk,r$,rEl$,o2s,s2o,csv2filas,getParamsHTML,inputOK};