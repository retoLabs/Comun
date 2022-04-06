/* 
Ejemplos de valores:
_id : ADMIN_Agro | SYSTEM_Agro | 507f191e810c19729de860ea
id0 : 0 | 1 | 1234567
usr : admin | system | tester | pepe | enric 
md5 : 191117e096647cc762afb345db79d2c9
rol : ADMIN | SYSTEM | TESTS | PAGES | ....
org : CAPOLAT | DEMO | XYZ | ...
keo : ES | CAT | MU | ...

En usersServer.sqlite:
CREATE TABLE users 
(_id varchar(30),
id0 number(10),
usr varchar(20),
md5 varchar(40) unique,
rol varchar(10),
org varchar(10),
keo varchar(5));

En Sesiones.sqlite:
CREATE TABLE sesiones 
(sesion_id number(10) unique,
_id varchar(30),
id0 number(10),
org varchar(10),
url varchar(50),
keo verchar(5));
*/


import utils  from '/k1/libK1_Utils.js';
import ajax   from '/k1/libK1_Ajax.js';
import vapps  from '/k1/libK1_vApps.js'


//------------------------------------------------------------------- Cerrar Sesión
function ecoCierraSesion(xhr){
	window.location = 'index.html';
}

function cierraSesion(){
	var stmt = 'delete from sesiones where sesion_id='+utils.vgk.sesion_id+';';
	var stmtB64 = Base64.encode(stmt);
	var body = {
		id   : utils.vgk.sesion_id,
		path : vgApp.sqlite.pathDB,
		db   : vgApp.sqlite.sessDB,
		stmt : stmtB64
	}
	var params = vgApp.paramsXHR;
	params.base = vgApp.sqlite.base;
	params.eco = ecoCierraSesion;

	ajax.ajaxCmdShell(params,body);
}

//------------------------------------------------------------------- Graba Sesión
function ecoGrabaSesion(xhr){
	if (xhr.responseText.match('error:0')) console.log ('Sesion actualizada')
	else alert('Algo ha ido mal');
}

function grabaSesion(){
	var stmt = "update sesiones set keo='"+ utils.vgk.sesion.keo+"' where sesion_id="+utils.vgk.sesion_id+";";
	var stmtB64 = Base64.encode(stmt);
	var body = {
		id   : utils.vgk.sesion_id,
		path : vgApp.sqlite.pathDB,
		db   : vgApp.sqlite.sessDB,
		stmt : stmtB64
	}
	var params = vgApp.paramsXHR;
	params.base = vgApp.sqlite.base;
	params.eco = ecoGrabaSesion;

	ajax.ajaxCmdShell(params,body);
}

//-------------------------------------------------------------------  Usuarios
function grabaUsuario(stmt,eco){
	var stmtB64 = Base64.encode(stmt);
	var body = {
		id : utils.vgk.sesion_id,
		path : vgApp.sqlite.pathDB,
		db   : vgApp.sqlite.userDB,
		stmt : stmtB64
	}
	var params = vgApp.paramsXHR;
	params.base = vgApp.sqlite.base;
	params.eco = eco; // validaSesion | editUserOwner | cambiaPWD

	ajax.ajaxCmdShell(params,body);

}
function updtUserMenu(xhr){
	var filas = utils.csv2filas(xhr.responseText)
	if (!filas) {alert('get Usuario: No filas');cierraSesion();}
	if (filas.length == 0){
		alert('No existe este usuario/password' );
		cierraSesion();
	}
	utils.vgk.user = filas[0];
	var userMenu = utils.r$(utils.vgk.userMenu || 'usrMenu');
	if (userMenu) userMenu.innerHTML = ' '+utils.vgk.user.usr;
	utils.vgk.fnUserOK();
}


function getUsuario4Menu(stmt){
	var stmtB64 = Base64.encode(stmt);
	var body = {
		id : utils.vgk.sesion_id,
		path : vgApp.sqlite.pathDB,
		db   : vgApp.sqlite.userDB,
		stmt : stmtB64
	}
	var params = vgApp.paramsXHR;
	params.base = vgApp.sqlite.base;
	params.eco = updtUserMenu; // validaSesion | editUserOwner

	ajax.ajaxCmdShell(params,body);

}


//------------------------------------------------------------------- Valida sesion
function ecoGetSesion(xhr){
	var filas = utils.csv2filas(xhr.responseText);
	if (filas.length == 1) {
		utils.vgk.sesion = filas[0];
		var _id = filas[0]._id;
		var id0 = filas[0].id0
		var stmt = 'select * from users where _id="'+_id+'" and id0='+id0+';';
		getUsuario4Menu(stmt, updtUserMenu);
		}
	else {
		alert('No existe la sesión con este idSess');
		cierraSesion();
		return false;
	}
}

function getSesion(sessId){
	utils.vgk.sesion_id = sessId;
	var stmt = 'select * from sesiones where sesion_id='+sessId+';';
	var stmtB64 = Base64.encode(stmt);
	var body = {
		id   : sessId,
		path : vgApp.sqlite.pathDB,
		db   : vgApp.sqlite.sessDB,
		stmt : stmtB64
	}
	var params = vgApp.paramsXHR;
	params.base = vgApp.sqlite.base;
	params.eco = ecoGetSesion;

	ajax.ajaxCmdShell(params,body);
}


function validaSesion(usrElem,fnOK){
	utils.vgk.usrMenu = usrElem;
	utils.vgk.fnUserOK = fnOK;

	utils.vgk.params = utils.getParamsHTML();
	if (utils.vgk.params.idSess){
		var items =  utils.vgk.params.idSess.split('::');
		if (items.length == 3){
			utils.vgk.topol_id = items[1];
			utils.vgk.nodo_id0 = items[2];
 			getSesion(items[0]);
		}
 		else getSesion(utils.vgk.params.idSess); 
	}
	else {console.log('No hay Id de sesión'); cierraSesion()};

}

//------------------------------------------------------------------- Login (index.html)

function ecoCreaSesion(xhr){
	if (xhr.responseText.match('error:0')) utils.vgk.fnUserOK(true,'SESION'); // en index.html
	else utils.vgk.fnUserOK(false,'SESION');
}

function creaSesion(){
	var valores = ''+utils.vgk.sesion_id;
	valores += ',"'+utils.vgk.user._id+'"';
	valores += ','+utils.vgk.user.id0;
	valores += ',"'+utils.vgk.user.org+'"';
	valores += ',"'+utils.vgk.user.keo+'"';

	var stmt = 'insert into sesiones (sesion_id,_id,id0,org,keo) ';
	stmt += 'values ('+valores+');'
	var stmtB64 = Base64.encode(stmt);

	var body = {
		id   : utils.vgk.sesion_id,
		path : vgApp.sqlite.pathDB,
		db   : vgApp.sqlite.sessDB,
		stmt : stmtB64
	}

	var params = vgApp.paramsXHR;
	params.base = vgApp.sqlite.base;
	params.eco = ecoCreaSesion;

	ajax.ajaxCmdShell(params,body,utils.vgk.async);

}

function ecoGetUser4Login(xhr){
	var filas = utils.csv2filas(xhr.responseText);

	if (!filas || filas.length != 1) {utils.vgk.fnUserOK(false,'USRPWD'); return false;}

	utils.vgk.user = filas[0];
	creaSesion();
}

function getUser4Login(md5){
	var stmt = "select * from users where md5='"+md5+"';";
	var stmtB64 = Base64.encode(stmt);
	var body = {
		id : utils.vgk.sesion_id,
		path : vgApp.sqlite.pathDB,
		db   : vgApp.sqlite.userDB,
		stmt : stmtB64
	}
	var params = vgApp.paramsXHR;
	params.base = vgApp.sqlite.base;
	params.eco = ecoGetUser4Login; // validaSesion | editUserOwner

	ajax.ajaxCmdShell(params,body,utils.vgk.async);

}

function ecoGetMD5(xhr){
	var md5 = xhr.responseText.substr(0,32);
	utils.vgk.fnGetMD5(md5);
}

function getMD5(usr,pwd){
	var body = {
		id: utils.vgk.sesion_id,
		usr: usr,
		pwd: pwd,
		ruta:vgApp.sqlite.pathDB
	};
	
	var params = vgApp.paramsXHR;
	params.base = vgApp.encript.base; // /shell/encript 
	params.eco = ecoGetMD5;

	ajax.ajaxCmdShell(params,body,utils.vgk.async);
}

function validaUser(usr,pwd,fnOK,async){
	if (!usr || !pwd) return;
	utils.vgk.async = async;

	utils.vgk.sesion_id = utils.vgk.idsSess.getId();
	utils.vgk.fnUserOK = fnOK;
	utils.vgk.fnGetMD5 = getUser4Login;
	getMD5(usr,pwd);
}

//
//------------------------------------------------------------------- Edit User


function ecoUpdtUsuario(xhr){
	if (xhr.responseText.match('error:0')) console.log ('Usuario actualizado')
	else alert('Algo ha ido mal');
	utils.vgk.appModal.show = false;
}

function actualizaUsuario(md5){
//	utils.vgk.appEdit.showModal = false;
	var user = utils.vgk.usuario;
	var stmt = 'update users set';
	stmt += ' usr="'+ user.usr+'",';
	stmt += ' org="'+ user.org+'",';
	stmt += ' md5="'+md5+'",';
	stmt += ' keo="'+user.keo+'"';
	stmt += ' where _id="'+user._id+'" and id0='+user.id0+';';
	grabaUsuario(stmt,ecoUpdtUsuario);
}


function cambiaPwdUser(){
	var keo = utils.vgk.user.keo;
	var itemx = new rUsuario('Usuario');
	itemx.fila2Clase(utils.vgk.user);
	vapps.editaItem('USER',itemx,grabaNuevoUser);
}

function updateUserKeo(){
	var user = utils.vgk.appModal.item;
	var keo = utils.vgk.appModal.idAct;
	var stmt = 'update users set keo="'+keo+'"';
	stmt += ' where _id="'+user.obj._id+'" and id0='+user.id0+';';
	console.log(stmt);
	grabaUsuario(stmt,ecoUpdtUsuario)

}
function cambiaKeoUser(){
	var keo = utils.vgk.user.keo;
	var itemx = new rUsuario('Usuario');
	itemx.fila2Clase(utils.vgk.user);
	itemx.obj.pwd ='falso';
	itemx.obj.conf = 'falso';
	console.log('**' + utils.o2s(itemx));
	var langs = utils.vgk.clasesML.getLangs();
	console.log(utils.o2s(langs));
	utils.vgk.appModal.items = langs;
	utils.vgk.appModal.idAct = langs[0].obj.keo;
	vapps.editaItem('CHKEO',itemx,updateUserKeo);
}

function grabaNuevoUser(user){
	if (user.obj.pwd != user.obj.conf){ alert('El password y la confirmación no coinciden'); return false;}
	utils.vgk.usuario = user.clase2Fila();	
	utils.vgk.fnGetMD5 = actualizaUsuario;
	getMD5(user.tag,user.obj.pwd);
}


export default {validaUser, getSesion,validaSesion,
	cierraSesion,cambiaPwdUser,cambiaKeoUser
}