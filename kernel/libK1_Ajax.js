//libK1_Ajax.js

// Para test, se inyecta en todoJunto:
//var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

import utils  from '/k1/libK1_Utils.js';

function creaXHR(metodo,url,eco,async){
	var xhr = new XMLHttpRequest();

// comprobar que soporta CORS    
	if ("withCredentials" in xhr) {
//		console.log('withCredentials');
      xhr.withCredentials = true;
    } 
	else {console.log('SIN withCredentials');}

// Para tests, se envia async = false	
	if (async == 'NO')	xhr.open(metodo, url, false);//true:async / false : sync
	else xhr.open(metodo, url, true);//true:async / false : sync

	xhr.setRequestHeader("Content-Type","application/json");
	xhr.onreadystatechange = function() {
//		console.log('readyState: ' + xhr.readyState);
      if (xhr.readyState != 4) {  return; }
      else {
//        console.log('status: ' + xhr.status);
		if (xhr.status == 200 ){eco(xhr);}
		else {console.log('Error MongDB: '+xhr.status)}
      }
    }
    xhr.onerror = function() {
      console.log('There was an error!');
      };
  return xhr;
}

//------------------------------------------------------------------- Post Topol
function ajaxPostTopol(params,async){
//	var url = params.url+params.base;
	var url = params.url+params.base;
	var eco = params.eco;
	var txt = params.txt;

	var xhr = creaXHR('POST',url,eco,async);

	xhr.send(txt);
}

//------------------------------------------------------------------- Put Topol
function ajaxPutTopol(params,async) {  
	var url = params.url+params.base+params.topolId;
	var eco = params.eco;
	var txt = params.txt;

	var xhr = creaXHR('PUT',url,eco,async);

   xhr.send(txt);

 }

//------------------------------------------------------------------- Delete Topol
function ajaxDeleteTopol(params,async) {  
	var url = params.url+params.base+params.topolId;
	var eco = params.eco;

	var xhr = creaXHR('DELETE',url,eco,async);

   xhr.send(null);
 }

//------------------------------------------------------------------- Duplica Topol
function ajaxDuplicaTopol(params,async) {  
	var url = params.url+params.base+params.topolId;
	var eco = params.eco;

	var xhr = creaXHR('DELETE',url,eco,async);

   xhr.send(null);
 }

//------------------------------------------------------------------- Get 1 Topol
function ajaxGet1Topol(params,async) {  
 	var url = params.url+params.base+params.topolId;
	var eco = params.eco;

	var xhr = creaXHR('GET',url,eco,async);

   xhr.send(null);
 }

//------------------------------------------------------------------- Get Metas All
function ajaxGetAll(params,async) {  
 	var url = params.url+params.base;
	var eco = params.eco;

	var xhr = creaXHR('GET',url,eco,async);

   xhr.send(null);

}

//------------------------------------------------------------------- Get Metas by iam
function ajaxGetMetas(params,async) {  
 	var url = params.url+params.base+params.iam;
	var eco = params.eco;

	var xhr = creaXHR('GET',url,eco,async);

   xhr.send(null);

}

//------------------------------------------------------------------- Get metas by iam & org
function ajaxGetMetasByOrg(params,async) {  
 	var url = params.url+params.base+params.iam+'/'+params.org;
	var eco = params.eco;

	var xhr = creaXHR('GET',url,eco,async);

   xhr.send(null);

}

//------------------------------------------------------------------- Post cmd shell
function ajaxCmdShell(params,cmdPar,async) {  
 	var url = params.url+params.base;
	var eco = params.eco;
	var xhr = creaXHR('POST',url,eco,async);
   xhr.send(utils.o2s(cmdPar));
}

export default {
	creaXHR,
	ajaxCmdShell,
	ajaxGetAll,ajaxGetMetas,ajaxGetMetasByOrg,ajaxGet1Topol,
	ajaxPostTopol,ajaxPutTopol,ajaxDeleteTopol,ajaxDuplicaTopol}