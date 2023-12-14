import topol from '../k1/libK1_Topol.js'
import utils from '../k1/libK1_Utils.js'

export class rUsuario extends topol.rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'rUsuario';
		this.obj = {
			_id : null,
			md5 : null,
			keo : null,
			org : null,
			url : null,
			pwd : null,
			conf : null
		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}

	fila2Clase(fila){
		this.id0 = fila.id0;
		this.tag = fila.usr;
		this.obj._id = fila._id;
		this.obj.md5 = fila.md5;
		this.obj.keo = fila.keo;
		this.obj.org = fila.org;
		this.obj.url = fila.url;
	}

	clase2Fila(fila){
		var fila= {};
		fila.id0 = this.id0;
		fila.usr = this.tag;
		fila._id = this.obj._id;
		fila.md5 = this.obj.md5;
		fila.keo = this.obj.keo;
		fila.org = this.obj.org;
		fila.url = this.obj.url;
		return fila;
	}
	errores(keo){
		var conds = mkValid('rUsuario',keo);
		console.log('rUsuario: ' + utils.o2s(conds));
		return conds;
	}
	vale(conds){
		if (!this.tag || !this.tag.match('[a-z]+')) conds.valid.tag.ok = false;
		if (!this.obj.pwd || !this.obj.pwd.match('[a-z]+')) conds.valid.pwd.ok = false;
		if (!this.obj.conf || !this.obj.conf.match('[a-z]+')) conds.valid.conf.ok = false;
		return conds;
	}

}

//------------------------------------------------------------------- Notas
/*
	El módulo de Notas permite asociar textos a una amplia variedad de objetos de la aplicación.
	Se graban en una BDD SQLite, propia de cada aplicación.
	
	Lase categorías son : [NOTAS|AGEND|BITAC|TOPOL]
	NOTAS: Simplemente un título (tag) y un texto (txt),que puede contener links a pág webs.
		El formato del link es ·[... url ... ·:· rótulo ]·.
		Por ej: ·[https://www.google.com·:·Google]· se transforma en <a href="https://www.google.com" target="_blank">Google</a>

	AGEND/BITAC, además tienen una campo dma para expresasr la fecha.
		Si la fecha es anterior a la fecha actual deberían estar en BITAC
		Si la fecha es posterior a la fecha actual, deberían estar en AGEND

	TOPOL: relacionadas con los nodos de la aplicación, mediante el _id de la topología y el id0 del nodo

*/
class rNota {
	constructor(categ,tema){
		this.iam = 'rNota';
		this.idf = null;		// id fila en tabla notas (SQLite)
		this._id = null;		// _id de la topologia (mongoDB)
		this.id0 = null;		// id0 del nodo en la topología
		this.org = null;		// org del user 
		this.ktg = categ;		// categoría de la nota
		this.tma = tema;		// tema de la nota
		this.dma = null;		//fecha (d/m/a)
		this.tag = null;			// tag de la nota
		this.txt = null;			// texto inicial
	}

	fila2Clase(fila){
		this.idf = fila.idf; // Ojo!! csv2filas pasa a minúsculas !!!!
		this._id = fila._id;
		this.id0 = fila.id0;
		this.org = fila.org;
		this.ktg = fila.ktg;
		this.tma = fila.tma;
		this.dma = fila.dia;
		this.tag = fila.tag;
		this.txt = fila.txt;
		this.convert('HTML');
	}

	convert(modo){
		var txt = null;
		switch(modo){
			case 'BBDD':
				var txt = this.txt.split('\n').join('·~');
				break;
			case 'EDIT':
				var txt = this.txt.split('<br>').join('\n');
				txt = txt.split('<a href="').join('·[');
				txt = txt.split('" target="_blank">').join('·:·');
				txt = txt.split('</a>').join(']·');
				break;
			case 'HTML':
				var txt = this.txt.split('·~').join('<br>');
				txt = txt.split('·!').join('|');
				txt = txt.split('·[').join('<a href="');
				txt = txt.split('·:·').join('" target="_blank">');
				txt = txt.split(']·').join('</a>');
				break;
			case 'FILA':
				var txt = this.txt.split('<br>').join('·~');
				txt = txt.split('<a href="').join('·[');
				txt = txt.split('" target="_blank">').join('·:·');
				txt = txt.split('</a>').join(']·');
				break;

		}
		this.txt = txt;
	}

	getInsertSQL(){
		var org = null;
		this.convert('FILA');
		if (utils.vgk.user) org = utils.vgk.user.org;
		else org = 'DEMO01';
		
		console.log(this.ktg,org);
		var stmt = null;
		switch(this.ktg){
			case 'NOTAS':
				stmt = "insert into notas ";
				stmt += "(org,ktg,tma,tag,txt) values (";
				stmt += "'"+org+"','"+this.ktg+"','"+this.tma+"','"+this.tag+"','"+this.txt+"');";
				break;
		}
		return stmt;
	}
	getUpdateSQL(){
		this.convert('FILA');
		var stmt = null;
		switch(this.ktg){
			case 'NOTAS':
				stmt = "update notas set ";
				stmt += "org='"+this.org+"',";
				stmt += "ktg='"+this.ktg+"',";
				stmt += "tma='"+this.tma+"',";
				stmt += "tag='"+this.tag+"',";
				stmt += "txt='"+this.txt+"' ";
				stmt += "where idf="+this.idf+";";
				break;
		}
		return stmt;
	}
	getDeleteSQL(){
		var stmt = null;
		stmt = "delete from notas where idf="+this.idf+";";
		return stmt;
	}

	vale(conds){
		conds.valid.tag.ok =  utils.inputOK('TAG',this.tag);
		return conds;
	}

}

//=================================================================== BTree para unique
//------------------------------------------------------------------- Nodo BTree

class rNodoBT extends topol.rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'topol.rNodoBT';
		this.obj = {
			tipo : '',
			claves : [],
			puntrs : []
		}
	}

	contieneClave(clau){
		var pos = this.obj.claves.indexOf(clau);
		return (pos == -1)? false : true;
	}

	buscaPtr(clau){
		var nk = this.obj.claves.length;
		var np = this.obj.puntrs.length;
		for (var i=0;i<nk;i++){
			if (this.obj.claves[i] > clau) return this.obj.puntrs[i];
		}
		return this.obj.puntrs[nk-1]  //.last();
	}

	altaClave(clau){
		this.obj.claves.push(clau);
		var aux = this.obj.claves.sort(function(a,b){return (a > b) });
		this.obj.claves = aux;
		return this.obj.claves.length;
	}

	altaPuntr(clau,ptr){
		var aux = 0;
		this.obj.puntrs.push(ptr);
		if (clau != this.obj.claves[this.obj.claves.length - 1]){ // .last()
			var ik = this.obj.claves.indexOf(clau);
			for (var i=this.obj.puntrs.length-1;i>ik+1;i--){
				aux = this.obj.puntrs[i];
				this.obj.puntrs[i] = this.obj.puntrs[i-1];
				this.obj.puntrs[i-1] = aux;
			}
		return this.obj.puntrs.length;
		}
	}
}

//------------------------------------------------------------------- Arbol BTree

class rBTree extends topol.rArbol{
	constructor(nombre,nodos,maxKs){
		super(nombre,nodos);
		this.meta.iam = 'rBtree';
		this.maxKs = maxKs;
	}
	buscaClau(nodo,clau){
		var elTipo = nodo.obj.tipo;
		if (nodo.obj.claves.length == 0) return false;
		else if (nodo.contieneClave(clau)) return true;
		else if (elTipo == 'HOJA') return false; 
		else if (nodo.obj.puntrs.length == 0) return false; // RAIZ, al principio
		else if (elTipo == 'RAIZ' || elTipo == 'NODO'){
			var ptr = nodo.buscaPtr(clau);
			var nodox = this.nodos[ptr];
			var esta = this.buscaClau(nodox,clau)
			return esta;
			}
		return null;
	}

	existe(clau){
		var esta = this.buscaClau(this.nodos[0],clau);
		return esta;
	}

	getNewNodo(){
		var nodo = new topol.rNodoBT('Nodo_' + this.nodos.length);
		nodo.obj.tipo = 'NODO';
		return nodo;
	}

	cambiaPadres(nodo){
		var n = nodo.obj.puntrs.length;
		for (var i=0;i<n;i++){
			this.nodos[nodo.obj.puntrs[i]].id1 = nodo.id0;
		}
	}

	splitNodo(nodo){
		var l = Math.floor(this.maxKs/2);
//		console.log('Split '+nodo.tag);
		var elTipo = nodo.obj.tipo;
		if (elTipo == 'RAIZ'){
			var nPtrs = nodo.obj.puntrs.length;  // antes de crear los nodos de split
			
			var nodoIzq = this.getNewNodo(); 
			var nodoDch = this.getNewNodo();

			this.addNodoHijo(nodo,nodoIzq); 
			var ixIzq = this.index.indexOf(parseInt(nodoIzq.id0));

			this.addNodoHijo(nodo,nodoDch);
			var ixDch = this.index.indexOf(parseInt(nodoDch.id0));

			nodoIzq.obj.claves = nodo.obj.claves.splice(0,l);
			nodoDch.obj.claves = nodo.obj.claves.splice(1,l);

			nodo.obj.puntrs.push(ixIzq);
			nodo.obj.puntrs.push(ixDch);
			
			if (nPtrs == 0){
				nodoIzq.obj.tipo = 'HOJA';
				nodoDch.obj.tipo = 'HOJA';
				}
			else{
				nodoIzq.obj.tipo = 'NODO';
				nodoDch.obj.tipo = 'NODO';
				nodoIzq.obj.puntrs = nodo.obj.puntrs.splice(0,l+1);
				nodoDch.obj.puntrs = nodo.obj.puntrs.splice(0,l+1);
				this.cambiaPadres(nodoIzq);
				this.cambiaPadres(nodoDch);
				}
			}
		else if (elTipo == 'NODO' || elTipo == 'HOJA'){
			var nodoDch = this.getNewNodo();
			nodoDch.obj.tipo = elTipo;
			this.addNodoHijo(nodo,nodoDch);
			var ixDch = this.index.indexOf(parseInt(nodoDch.id0));
			nodoDch.obj.claves = nodo.obj.claves.splice(l+1,l);
			if (elTipo == 'NODO'){
				nodoDch.obj.puntrs = nodo.obj.puntrs.splice(l+1,l+1);
				this.cambiaPadres(nodoDch);
				}

			var padre = this.getNodoById(nodo.id1);
			var clau = nodo.obj.claves.splice(l,1);
			var nk = padre.altaClave(clau);
			var np = padre.altaPuntr(clau,ixDch);
			if(nk > this.maxKs) this.splitNodo(padre);
			}
	}

	buscaNodo(nodo,clau){
		var elTipo = nodo.obj.tipo;
		if (nodo.obj.tipo == 'HOJA'){return nodo;}
		else if (elTipo == 'RAIZ' && nodo.obj.puntrs.length == 0){return nodo;}
		else if (elTipo == 'RAIZ' && nodo.obj.puntrs.length > 0){
			var ptr = nodo.buscaPtr(clau);
			if (!ptr) alert('ptr nulo');
			var nodox = this.nodos[ptr];
			var nodox = this.buscaNodo(nodox,clau);
			return nodox;
			}
		else if (elTipo == 'NODO'){
			var ptr = nodo.buscaPtr(clau);
			if (!ptr) alert('ptr nulo');
			var nodox = this.nodos[ptr];
			var nodox = this.buscaNodo(nodox,clau);
			return nodox;
			}
	}

	altaClave(clau){
		var nodo = this.buscaNodo(this.nodos[0],clau);
		var n = nodo.altaClave(clau);
		if (n > this.maxKs){
			this.splitNodo(nodo);
			}
	}
}


//------------------------------------------------------------------- Arbol de Cálculos

export class NodoCalc extends topol.rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'NodoCalc';
		this.obj = {
			kVariab : '',
			formula : '',
			valor : 0
		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}
}

export class ArbolCalc extends topol.rArbol {
	constructor(tag,nodos){
		super(tag,nodos);
		this.meta.iam = 'ArbolCalc';
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = 'ArbolCalc';
	}

	evaluaFormula(nodo){

		var expr = nodo.obj.formula;
		var hijos = nodo.hijos;
		var n = hijos.length;
		for (var i=0;i<n;i++){
			var idH = hijos[i];
			var nodoH = this.getNodoById(idH);
			var valorH = this.evaluaNodo(nodoH);
			var kVar = '·'+nodoH.obj.kVariab+'·';
			expr = expr.replace(kVar, (''+valorH));
		}

		nodo.obj.valor = eval(expr);
		return nodo.obj.valor;
	}
	evaluaNodo(nodo){
		if (!nodo.obj.formula) return nodo.obj.valor;
		else {
			var valorFormula = this.evaluaFormula(nodo);
			return valorFormula;
			}
		return nodo.obj.valor;
	}
}

//=================================================================== IDIOMAS

//------------------------------------------------------------------- Arbol ClasesML

class rClasesML extends topol.rArbol {
	constructor(nombre,nodos){
		super(nombre,nodos);
		this.meta.iam = 'rClasesML';
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = 'rClasesML';

	}

	addNodoLang(lang){
		var raspa = this.getRaspa();
		raspa.map(function(nodo){
			if (nodo.rol == 'LANGS'){
				this.addNodoHijo(nodo,lang);
				this.syncLangsRaiz();
			}
		}.bind(this))
	}

	borraNodoLang(lang){
		this.borraNodo(lang);
		this.syncLangsRaiz();
	}

	syncLangsRaiz(){
		var raiz = this.getRaiz();
		raiz.obj.keos = [];

		var raspa = this.getRaspa();
		raspa.map(function(nodo){
			if (nodo.rol == 'LANGS'){
				var langs = this.getHijosNodo(nodo);
				langs.map(function(lang){
					raiz.obj.keos.push(lang.obj.keo);
				}.bind(this))
			}
		}.bind(this))

	}
	getLangs(){
		var langs = [];
		var raspa = this.getRaspa();
		raspa.map(function(nodo){
			if (nodo.rol == 'LANGS'){
				var idsH = nodo.hijos;
				idsH.map(function(idH){
					var lang = this.getNodoById(idH);
					langs.push(lang);
				}.bind(this))
			}
		}.bind(this))

		return langs;
	}
// Esta función sirve la versión [keo] de los mensajes de error al validar el form
// en cualquier página
	getTextos(iam,keo){
//		console.log('getTextos: '+iam+':'+keo);
		var textos = {retol:'',valid:{}};
		var raspa = this.getRaspa();
		raspa.map(function(nodo){
			if (nodo.rol == 'NODOS'){
				var idsH = nodo.hijos;
				idsH.map(function(idH){
					var frm = this.getNodoById(idH);
					if (frm.obj.clase == iam){
						textos.retol = frm.obj.retol[keo];
						textos.valid = frm.obj.valid[keo];
					}
				}.bind(this))
			}
		}.bind(this))
		return textos ;

	}

	addTextosEdit(nodoC){
		var forms = null;
		var raspa =this.getRaspa();
		raspa.map(function(nodo){
			if (nodo.rol == 'NODOS') forms = nodo;
		})
		this.addNodoHijo(forms,nodoC)

	}

	getTextosEdit(iam){
//		console.log('getTextosEdit: '+iam);
		var matriz = [];
		var raspa = this.getRaspa();
		raspa.map(function(nodo){
			if (nodo.rol == 'NODOS'){
				var hijos = this.getHijosNodo(nodo);
				hijos.map(function(hijo){
					if (hijo.obj.clase == iam){matriz = hijo.getMatriz();}//this.getMatrizTextos(hijo)}
				}.bind(this))
			}
		}.bind(this))
		return matriz ;

	}

}

//------------------------------------------------------------------- Nodo Keos
export class rKeos extends topol.rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'rKeos';
		this.obj = {
			keos :[]
		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}

	addKeo(keo){
		this.obj.keos.push(keo);
	}
}

//------------------------------------------------------------------- Nodo Lang
export class rLang extends topol.rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'rLang';
		this.obj = {
			keo :'',
			flag :''
		}
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}

	errores(keo){
		var conds = mkValid('rLang',keo);
//		console.log('rLang: ' + o2s(conds));
		return conds;
	}
	vale(conds){
//		console.log('Vale: '+ this.tag+':'+this.obj.keo+':'+this.obj.flag);
		conds.valid.tag.ok = (this.tag && this.tag.match('[a-z]+')) ;
		conds.valid.keo.ok = (this.obj.keo && this.obj.keo.match('[A-Z]+'));
		conds.valid.flag.ok = (this.obj.flag && this.obj.flag.match('[a-z]+'));
		return conds;
	}
}

//------------------------------------------------------------------- Nodo TagML
export class rTagML extends topol.rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'rTagML';
		this.obj = {
			keo :'',
			tags : null
		}
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}

	errores(keo){
		var conds = mkValid('rTagML',keo);
		return conds;
	}
	vale(conds){
		return conds;
	}
}

//------------------------------------------------------------------- Nodo Clase
export class rNodoClase extends topol.rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'rNodoClase';
		this.obj = {
			clase : '',
			retol : {},
			valid : {}
		}
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = objDB.iam;
		this.obj = objDB.obj;
	}

	getMatriz(){
		var matriz = [];
		var raiz = utils.vgk.clasesML.getRaiz();
		var keos = raiz.obj.keos;
		var keys = [];

		keos.map(function(keo){
			if (this.obj.valid[keo]){
				keys = [];
				for (var key in this.obj.valid[keo]) {
					keys.push(key);
				}
			}
		}.bind(this))
		console.log('keys:'+keys);
		var filaH = {'clau':'Campo','lang':'Idioma','text':'Texto'};
		matriz.push(filaH);
		
		keos.map(function(keo){
			var fila = {};
			fila['clau'] = 'retol';
			fila['lang'] = keo;
			fila['text'] = this.obj.retol[keo];
			matriz.push(fila);
		}.bind(this))

		keys.map(function(key){
			keos.map(function(keo){
				var fila = {};
				fila['clau'] = key;
				fila['lang'] = keo;
				if (this.obj.valid[keo]) fila['text'] = this.obj.valid[keo][key];
				else fila['text']='';
				matriz.push(fila);
			}.bind(this))
		}.bind(this))
		return matriz;
	}

	setMatriz(matriz){
		matriz.map(function(fila){
			if (fila.clau === 'retol') this.obj.retol[fila.lang] = fila.text;
			else if (!this.obj.valid[fila.lang]){
				this.obj.valid[fila.lang]={};
				this.obj.valid[fila.lang][fila.clau] = fila.text;
			}
			else this.obj.valid[fila.lang][fila.clau] = fila.text;
		}.bind(this))
	}
}

//=================================================================== Textos ML

class rTextosML extends topol.rConjt {
	constructor(nombre,nodos){
		super(nombre,nodos);
		this.meta.iam = 'rTextosML';
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = 'rTextosML';

	}

	getMatriz(){
		var matriz = [];
		var raiz = utils.vgk.clasesML.getRaiz();
		var keos = raiz.obj.keos;
		var fila = {};
		fila['tag'] = 'Opcion';
		fila['cod'] = 'Codigo';
		fila['keo'] = 'Idioma';
		fila['txt'] = 'Texto';
		matriz.push(fila);

		this.nodos.map(function(nodo){
			keos.map(function(keo){
				var fila = {};
				fila['id0'] = nodo.id0;
				fila['tag'] = nodo.tag;
				fila['cod'] = nodo.cod;
				fila['keo'] = keo;
				if (nodo.lng[keo]) fila['txt'] = nodo.lng[keo];
				else fila['txt']='';
				matriz.push(fila);
			}.bind(this))
		}.bind(this))
		return matriz;
	}

	setMatriz(matriz){
		matriz.map(function(fila){
			var nodo = this.getNodoById(fila.id0);
			if (nodo && fila.txt) nodo.lng[fila.keo] = fila.txt;
		}.bind(this))
	}
}

export class rTxtML extends topol.rNodo {
	constructor(tag,cod){
		super(tag);
		this.iam = 'rTxtML';
		this.cod = cod;
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = 'rTxtML';
		this.cod = objDB.cod;

	}

	errores(keo){
		var conds = mkValid('rTxtML',keo);
//		console.log('rTxtML: ' + o2s(conds));
		return conds;
	}
	vale(conds){
//		console.log('Vale: '+ this.tag+':'+this.cod);
		conds.valid.tag.ok = (this.tag && this.tag.match('[a-z]+')) ;
		conds.valid.cod.ok = (this.cod && this.cod.match('[A-Z]+'));
		return conds;
	}
}
//------------------------------------------------------------------- Menus ML
class rMenuML extends rTextosML {
	constructor(nombre,nodos){
		super(nombre,nodos);
		this.meta.iam = 'rMenuML';
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = 'rMenuML';

	}
}

//------------------------------------------------------------------- Dicc ML
class rDiccML extends rTextosML {
	constructor(nombre,nodos){
		super(nombre,nodos);
		this.meta.iam = 'rDiccML';
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = 'rDiccML';

	}
}


export default {
	rNota,
	rMenuML,rDiccML,rTxtML,rTextosML,rClasesML,rKeos,rTagML,
	NodoCalc,ArbolCalc
}