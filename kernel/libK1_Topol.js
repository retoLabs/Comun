//libK1_Topol.js

/*
=====================================================================
		Definiciones de la Topologia RETO
=====================================================================
	Un NODO es una Clase JS, con las propiedades:
		+ {tag} : el rótulo  que representa este nodo
		+ {id0} : el identificador  (núm entero, generado aleatoriamente)
		+ {iam} : un string que representa la clase
		+ {rol} : un string que representa el rol del nodo en una topología 
		+ {lng} : un objeto JS, con las traducciones del tag a varios idiomas 

	En entornos multilenguaje, al generar los <div> que representan el nodo,
	se usará el método getTag(keo), para obtener el tag en el idioma	apropiado.

	Nota: 'keo' representa el código del idioma ([ES|CAT|EN|FR|IT|...])

	En una aplicación dada, los nodos representan conceptos del mundo real:
		Por ej: personas, viviendas, contratos, plantas, fincas, etc etc

	Al crear las clases de estos conceptos, como extensión de un nodo,
	las propiedades de los conceptos, se definen en un campo:
		+ {obj} : es un objeto JS con las propiedades adecuadas al concepto

	Un DRAG es un Nodo, con una Clase {dim}, que define sus dimensiones:
		+ {x} : pos X (left de la la <div>)
		+ {y} : pos Y (top de la <div>)
		+ {w} : ancho (width de la <div>)
		+ {h} : alto (height de la <div>)
	Sirve para hacer Drag&Drop.

	Un ARCO es un objeto, que representa la relación entre dos Nodos en un Grafo
	Consta básicamente de :
		+{tag}
		+{id0} : Apunta al {id0} del Nodo origen
		+{id1} : Apunta al {id0} del Nodo destino

	Para preservar la unicidad de id0's en una topología, el {id0} del arco:
		var id0_calc = ((id0_real + 123) ^ id1);
		var id0_real = ((id0_calc ^ id1) - 123);

		Nota: 123 es un número escogido arbitrariamente. 
		Diferencia {id0_calc} entre: Arcos A-->B, y Arcos B-->A

	Un ARCO es un Arco, que representa la relación entr dos Nodos en una Malla
	Siempre representa un arco de un nodo NROW a un nodo NCOL
	Consta de:
		+ {valor} : es el valor que aparecerá en la celda de la tabla


	Una TOPOLOGIA es una Clase JS, (en la práctica: un Array de Nodos).
	El {id0} de los nodos debe ser único dentro de la Topología.
	Según la Topología, los nodos adquieren otras propiedades
	Por ejemplo :
		Conjt : Nodos | Drags
		Lista : Nodos con un numeral de orden {num}
		Arbol : Nodos con {id1} que apunta al {id0} del nodo padre
		Grafo : [Nodos | Drags] + Arcos (Nodos con rol = 'NODO', Arcos con rol = 'ARCO')
		Malla : Nodos + arco (Nodos con rol = ['NROW'|'NCOL'], arco con rol = 'ARCO')

	Cada topología puede tener métodos para añadir propiedades de forma
	que se optimize el manejo de los nodos.

	META es una Clase JS que define la topología entera. Consta de:
		+ {tag} : Rótulo de la Topología
		+ {iam} : Clase de la Topología
		+ {org} : Organización a la que pertenece la Topología

	Es necesaria para Grabar/Leer topologías en MongoDB.

	Cuando se graba, MongoDB asigna un _id.
	Mediante estos _id's, se pueden vincular topologías a nodos, de forma que se
	podrían modelizar:
		+ Listas de Grafos
		+ Conjuntos de Listas de Grafos, 
		+ Grafos de Arboles, 
		+ etc etc

	Cuando se lee una Topología, por la propiedad {iam} se convierte el Objeto JS
	que devuelve  MongoDB, en la Clase adecuada en la aplicación.

	Es recursiva esta transformación, mediante los métodos objDB2Clase(objDB)
	definidos en cada clase.
*/


import utils   from '/k1/libK1_Utils.js'

//=================================================================== NODOS/ARCOS
//------------------------------------------------------------------- Class Nodo
class rNodo {
	constructor(tag){
		this.id0 = utils.vgk.idsNodo.getId(); // libK1_Utils.js
		this.tag = tag || ('Nuevo');
		this.iam = 'rNodo';
		this.rol = 'NODO';
		this.lng ={};
	}
	
	getTag(keo){
		if (this.lng[keo]) return this.lng[keo];
		else return this.tag;
	}

	otroId(){ 
		this.id0 = utils.vgk.idsNodo.getId();
	}
	objDB2Clase(objDB){
		this.id0 = objDB.id0;
		this.tag = objDB.tag;
		this.iam = 'rNodo';
		this.rol = objDB.rol;
		this.lng = objDB.lng || {};
	}

	clase2ObjDB(){
		return {'id0':this.id0,'tag':this.tag,'iam':this.iam,'rol':this.rol};
	}
}

//------------------------------------------------------------------- Class Drag

export class rDim {
	constructor(x,y,w,h){
	this.x = x ||0;
	this.y = y ||0;
	this.w = w ||0;
	this.h = h ||0;
	}

	objDB2Clase(objDB){
		this.x = objDB.x;
		this.y = objDB.y;
		this.w = objDB.w;
		this.h = objDB.h;
	}

	random(x,y,w,h){
		if (!x || !y || !w || !h) return this;
		this.x = Math.floor(Math.random()*w + x);
		this.y = Math.floor(Math.random()*h + y);
		return this;
	}
	toString(){
		var strDim = '';
		if (!this.w || !this.h) strDim = 'NdN';
		else if (this.x >=0 && this.y >=0) strDim = this.w+'x'+this.h+'+'+this.x+'+'+this.y;
		else if (this.x >=0 && this.y < 0) strDim = this.w+'x'+this.h+'+'+this.x+'-'+(-this.y);
		else if (this.x < 0 && this.y >=0) strDim = this.w+'x'+this.h+'-'+this.x+'+'+this.y;
		else if (this.x < 0 && this.y < 0) strDim = this.w+'x'+this.h+'-'+(-this.x)+'-'+(-this.y);

		return strDim;
	}

}



export class rDrag extends rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'rDrag';
		this.dim = new rDim(0,0,0,0);
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.dim = new rDim(0,0,0,0);
		this.dim.objDB2Clase(objDB.dim);
	}
}


//------------------------------------------------------------------- Class Arco
class rArco extends rNodo{
	constructor(tag,idI,idF){
		super(tag);
		this.iam = 'rArco';
		this.rol = 'ARCO';
		this.idI = idI; 
		this.idF = idF;
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = 'rArco';
		this.rol = 'ARCO';
		this.idI = objDB.idI;
		this.idF = objDB.idF;
		this.ixI = objDB.ixI;
		this.ixF = objDB.ixF;
	}
}

//=================================================================== TOPOLOGIAS BASE
//------------------------------------------------------------------- Class Meta
class rMeta {
	constructor(tag,iam,org){
	this.tag = tag || 'Sin nombre';
	this.iam = iam || 'Desconocida';
	this.org = org || 'No Org';
	}
	objDB2Clase(objDB){
		this.tag = objDB.tag;
		this.iam = objDB.iam;
		this.org = objDB.org;
	}
}

//------------------------------------------------------------------- Class Topol
class rTopol {
	constructor(nombre,nodos) {
		this.nodos = [];
		this.index = [];
		this.repes = {};
		this.meta = new rMeta(nombre);
		this.meta.iam = 'rTopol';
		this.meta.org = utils.vgk.user.org;
		if (nodos && nodos.length) this.initTopol(nodos);
}

	initTopol(nodos){
		nodos.map(function(nodo){
			this.addNodo(nodo);
		}.bind(this)) ;
	}
	addNodo(nodo){
		var oldId = nodo.id0;
		while (this.index.indexOf(nodo.id0) != -1){
			nodo.otroId();
		}  // unicidad id0
		this.nodos.push(nodo);
		this.index.push(nodo.id0);
		if (oldId != nodo.id0){ 
			this.repes['old_'+oldId] = nodo.id0;
			console.log('Repes:' + JSON.stringify(this.repes));
		}
	}

	updtNodoSelf(nodo){
		var ix = this.index.indexOf(nodo.id0);
		if (ix == -1) console.log('Nodo inexistente')
		else this.nodos[ix] = nodo;

	}

	borraNodo(nodo){
		var ix = this.index.indexOf(parseInt(nodo.id0));
		if (ix == -1) return; // el id0 no se encuentra;
		this.index.splice(ix,1);
		this.nodos.splice(ix,1);
	}

	getNodos(){
		return this.nodos;
	}
	getNodoById(id){
		var ix = this.index.indexOf(parseInt(id));
		if (ix == -1 ) return null; // no existe ese id0
		var nodo = this.nodos[ix];
		return nodo;
	}

	swapNodos(ixa,ixb){
		console.log('swap',ixa,ixb,utils.o2s(this.index));
		var aux = this.nodos[ixb];
		this.nodos[ixb] = this.nodos[ixa];
		this.nodos[ixa] = aux;

		this.index[ixb] = this.nodos[ixb].id0;
		this.index[ixa] = this.nodos[ixa].id0;
		console.log('swap',ixa,ixb,utils.o2s(this.index));
	}

	subeNodo (nodo){
		const N = this.index.indexOf(parseInt(nodo.id0));
		if (N <= 0) return;
		this.swapNodos(N,N-1);
	}

	bajaNodo (nodo){
		const N = this.index.indexOf(parseInt(nodo.id0));
		if (N >= this.nodos.length-1) return;
		this.swapNodos(N,N+1);
	}

	getNodoByIx(ix){
		if (ix < 0 || ix > this.nodos.length-1 ) return null; // no existe ese ix
		return this.nodos[ix];
	}

	objDB2Clase(objDB){
		this.meta = new rMeta();
//		this.meta.objDB2Clase(objDB.meta);
		this.meta.objDB2Clase(objDB.meta);

		objDB.nodos.map(function(nObj){
			if (nObj.iam){ var nodo = eval('new '+nObj.iam+'()');}
			else var nodo = new rNodo();
			nodo.objDB2Clase(nObj);
			this.addNodo(nodo);
		}.bind(this))
	}

	clase2ObjDB(){
		var nodosOK = [];
		var n = this.nodos.length;
		for (var i=0;i<n;i++){
			var nodo = this.nodos[i];
			if (this.index[i]) nodosOK.push(nodo); // elimina los borrados
		}

		var objDB = {"meta": this.meta,"nodos":nodosOK}
		return objDB;
	}


}

//------------------------------------------------------------------- Class Conjt
class rConjt extends rTopol {
	constructor(nombre,nodos) {
		super(nombre,nodos);
		this.meta.iam = 'rConjt';
	}
	addNodoSelf(nodo){
		super.addNodo(nodo);
	}
}

//------------------------------------------------------------------- Class Lista
class rLista extends rTopol {
	constructor(nombre,nodos){
		super(nombre,nodos);
		this.meta.iam = 'rLista';
		this.optimiza(this.nodos);
	}
	optimiza (nodos){
		nodos.map(function(nodo,ix){
			nodo.num = ix;
		})
	}

	ordena (){
		var nodos = this.nodos.sort(function(a,b){return (a.tag > b.tag) });
		nodos.map(function(nodo,ix){
			nodo.num = ix;
		})
		this.nodos = nodos;
	}

	addNodoSelf(nodo){
		super.addNodo(nodo);
		this.optimiza(this.nodos);
	}

	subeNodo(nodo){
		super.subeNodo(nodo);
		this.optimiza(this.nodos);
	}

	bajaNodo(nodo){
		super.bajaNodo(nodo);
		this.optimiza(this.nodos);
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB); // rTopol
		this.meta.iam = 'rLista';
		this.optimiza(this.nodos);
	}
}

//------------------------------------------------------------------- Class Arbol
class rArbol extends rTopol {
	constructor(nombre,nodos) {
		super(nombre,nodos);
		this.meta.iam = 'rArbol';
		this.orfes = []
		this.optimiza(this.nodos);

	}
// Crear hijos y poner estados EXPAN | NCOLAP | FULLA
	optimiza (nodos){
		nodos.map(function(nodo,ix){
			nodo.stat = 'FULLA';
			nodo.hijos = [];

			if (ix > 0){ // no es el nodo [0]
				var padre = this.getNodoById(nodo.id1);
				if (!padre){this.orfes.push(nodo);}
				else {
					padre.hijos.push(nodo.id0);
					if (padre.stat = 'FULLA') padre.stat = 'EXPAN';
				}
			}
		}.bind(this));
	}

	objDB2Clase(objDB){
		this.meta = new rMeta(objDB.meta.nombre);
		this.meta.objDB2Clase(objDB.meta);

		objDB.nodos.map(function(nObj){
			try {var nodo = eval('new '+nObj.iam+'()');} catch (e){console.log('iam no encontrado: '+nObj.iam+' en Obj: ' + this.meta.tag );};
			if (nodo){
				nodo.objDB2Clase(nObj);
				nodo.id1 = nObj.id1;
				this.addNodo(nodo);
			}
		}.bind(this))

		this.optimiza(this.nodos);  // para poner {stat} y {hijos}
	}

	getOrfes (){
		return this.orfes;
	}
	
	getRaiz (){
		return this.nodos[0];
	}

	getRaspa (){
		var raspa = [];
		var idsRaspa = this.nodos[0].hijos;
		idsRaspa.map(function(id){
			var nodo = this.getNodoById(id);
			raspa.push(nodo);
		}.bind(this));
		return raspa;
	}

	getHijosNodo(nodo){
		var hijos = [];
		nodo.hijos.map(function(idH){
			var hijo = this.getNodoById(idH);
			hijos.push(hijo);
		}.bind(this));
		return hijos;
	}

	borraHijosNodo(nodo){
		var hijos = this.getHijosNodo(nodo);
		hijos.map(function(hijo){
			this.borraNodo(hijo);
		}.bind(this))
	}

	addNodoSelf(nodo){
		if (!this.nodos.length){
			super.addNodo(nodo);
			this.optimiza(this.nodos);
		}
		else {
			var raiz = this.getRaiz();
			this.addNodoHijo(raiz,nodo);
		}
	}

	subeNodo(nodo){
		var padre = this.getNodoById(nodo.id1);
		var h = padre.hijos;
		var N = h.indexOf(nodo.id0);
		if (N==0) return;
		var germa = h[N-1];
		var ixA = this.index.indexOf(nodo.id0);
		var ixB = this.index.indexOf(germa);
		super.swapNodos(ixA,ixB);
		this.optimiza(this.nodos);
	}

	bajaNodo(nodo){
		var padre = this.getNodoById(nodo.id1);
		var h = padre.hijos;
		var N = h.indexOf(nodo.id0);
		if (N==h.length-1) return;
		var germa = h[N+1];
		var ixA = this.index.indexOf(nodo.id0);
		var ixB = this.index.indexOf(germa);
		super.swapNodos(ixA,ixB);
		this.optimiza(this.nodos);
	}

	addNodoHijo(padre,hijo){
		if (this.index.indexOf(padre.id0) == -1) {console.log('padre no existe !!');return;}
		hijo.stat = 'FULLA';
		hijo.hijos = [];
		this.addNodo(hijo); // rTopol
		hijo.id1 = padre.id0;
		padre.hijos.push(hijo.id0);
		if (padre.stat == 'FULLA')	padre.stat = 'EXPAN';
	}


	borraNodo(nodo){
		var hijos = [];
		nodo.hijos.map(function(idH){hijos.push(idH)});
		var n = hijos.length;
		for (var i=0;i<n;i++){
			var nodoH = this.getNodoById(hijos[i]);
			this.borraNodo(nodoH);
		}
		var padre = this.getNodoById(nodo.id1);
		var ixH = padre.hijos.indexOf(nodo.id0);
		padre.hijos.splice(ixH,1);
		
		super.borraNodo(nodo);
	}

	commuta(nodo){
		if (nodo.stat == 'EXPAN') nodo.stat = 'NCOLAP';
		else nodo.stat = 'EXPAN';
	}
}

//------------------------------------------------------------------- Class Grafo
class rGrafo extends rTopol {
	constructor(nombre,nodos) {
		super(nombre,nodos);
		this.arcos = [];
		this.iArcs = [];
		this.meta.iam = 'rGrafo';
		if (nodos.length){
			this.separaNodos();
			this.optimizaArcos();
			this.ajustaIndices();
		}
	}

	separaNodos(){
		var nodos = [];
		var index = [];
		this.arcos = [];
		this.iArcs = [];
		this.nodos.map(function(nodo){
			if (nodo.rol == 'ARCO'){
				this.arcos.push(nodo);
				this.iArcs.push(nodo.id0);
			}
			else {
				nodos.push(nodo);
				index.push(nodo.id0);
			}
		}.bind(this))
		this.nodos = nodos;
		this.index = index;
	}

	optimizaArcos(){
		var arcos = [];
		var idx,id0,id1,ixI,ixF;
		this.arcos.map(function(arc){
			console.log(utils.o2s(arc));
			ixI = this.index.indexOf(arc.idI);
			ixF = this.index.indexOf(arc.idF);

			if (ixI >=0 && ixF >= 0) {
				arc.ixI = ixI;
				arc.ixF = ixF;
				arcos.push(arc);
			}
			else (console.log('Arco sin Nodo'));
		}.bind(this))
		this.arcos = arcos;
//		console.log(this.arcos.length + ' arcos');
	}

// Para tener indices separados, y que indexOf concuerde con los nodos de 'addNodo'
// y poder detectar la existencia de un arco
	ajustaIndices(){
		this.index = [];
		this.nodos.map(function(nodo){
			this.index.push(nodo.id0);
		}.bind(this));

		this.iArcs = [];
		this.arcos.map(function(arco){
			this.iArcs.push(arco.id0);
		}.bind(this));
	}

	getArcos(){
		return this.arcos;
	}

	getArcoById(id0){
		var ix = this.iArcs.indexOf(id0);
		if (ix == -1) return null;
		else return this.arcos[ix];
	}

	getArcoByIxs(ixI,ixF){
		var arco = null;
		this.arcos.map(function(arc){
			if (parseInt(arc.ixI) == ixI && parseInt(arc.ixF) == ixF) arco = arc;
		}.bind(this))
		return arco;
	}

	getVecinos(nodo){
		var veins = [];
		this.arcos.map(function(arc){
			var id0 = arc.idI;
			if (id0 == nodo.id0){
				var nodoF = this.getNodoById(id0);
				var vei = {"n":nodoF,"a":arc};
				veins.push(vei);
			}
		}.bind(this))
		return veins;
	}
	
	addNodoSelf(nodo){
		super.addNodo(nodo);
	}
	borraNodo(nodo){
		console.log(utils.o2s(this.index));
		var ixNodo = this.index.indexOf(nodo.id0);
		if (ixNodo == -1){console.log('Nodo inexistente !!'); return false;}
		else {
			var arcosOK = [];

			var n = this.arcos.length;
			for(var i=0;i<n;i++){
				var arco = this.arcos[i];
				console.log(ixNodo+':'+arco.nodoI+'-'+arco.nodoF);
				if ((arco.ixI != ixNodo) && (arco.ixF != ixNodo)) arcosOK.push(arco);
			}
			super.borraNodo();
			this.arcos = arcosOK;
			this.ajustaIndices();
			this.optimizaArcos();
		}
		console.log(utils.o2s(this.index));
		console.log(utils.o2s(this.iArcs));
	}


	addArcoSelf(arco){
		var ixI = this.index.indexOf(arco.idI);
		var ixF = this.index.indexOf(arco.idF);

		if (ixI >=0 && ixF >= 0) {
			arco.ixI = ixI;
			arco.ixF = ixF;
			this.arcos.push(arco);
			this.iArcs.push(arco.id0);
		}
		else (console.log('Arco sin Nodo'));

	}


	borraArco(arco){
		var ixArco = this.iArcs.indexOf(arco.id0);
		if (ixArco == -1) return false;
		else {
			this.arcos.splice(ixArco,1);
			this.ajustaIndices();
		}
	}


	existArco (arco){
		if (this.iArcs.indexOf(arco.id0) != -1) return true;
		else return false;

	}
	updtArcoSelf (arco){
		var ix = this.iArcs.indexOf(arco.id0);
		if (ix == -1) return false;
		else {
			this.arcos[ix] = arco;
		}

	}

	getDimsArcos(){
		var dims = [];
		var n = this.arcos.length;
		for (var i=0;i<n;i++){
			var arco = this.arcos[i];
			var nodoI = this.getNodoById(arco.idI);
			var nodoF = this.getNodoById(arco.idF);
			var dim = {i:nodoI.dim,f:nodoF.dim};
			dims.push(dim);
		}
		return dims;
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB); // rTopol
		this.meta.iam = 'rGrafo';
		this.separaNodos();
		this.optimizaArcos();
		this.ajustaIndices();
	}

	clase2ObjDB(){
		var todo = this.nodos.concat(this.arcos);
		return {"meta": this.meta,"nodos":todo};
	}

}
//------------------------------------------------------------------- Class Malla
// Pseudo Grafo. Los arcos van de un conjunto de nodos a otro
class rMalla extends rTopol{
	constructor(nombre,nodos){
		super(nombre,nodos);
		this.meta.iam = 'rMalla';


		this.ncols = [];
		this.nrows = [];
		this.arcos = [];

		this.iCols = [];
		this.iRows = [];
		this.iArcs= [];

		this.separaNodos();
		this.optimizaArcos()
	}

	separaNodos(){
		this.nrows = [];
		this.ncols = [];
		this.arcos = [];

		this.iCols = [];
		this.iRows = [];

		var roles = ['NROW','NCOL','ARCO'];
		this.nodos.map(function(nodo){
			if (!nodo.rol || roles.indexOf(nodo.rol) == -1) console.log('Nodo',nodo.tag,'sin ROL OK');
			else if (nodo.rol == 'NCOL'){this.ncols.push(nodo); this.iCols.push(nodo.id0);}
			else if (nodo.rol == 'NROW'){this.nrows.push(nodo); this.iRows.push(nodo.id0);}
			else if (nodo.rol == 'ARCO'){this.arcos.push(nodo);}
		}.bind(this))
	}

	optimizaArcos(){
		this.iArcs = [];
		this.arcos.map(function(arc){
			arc.ixI = this.iRows.indexOf(arc.idI);
			arc.ixF = this.iCols.indexOf(arc.idF);
			this.iArcs.push(arc.ixI+':'+arc.ixF);
		}.bind(this))
	}

	regenera(){
		var nodos = [];
		nodos = nodos.concat(this.ncols);
		nodos = nodos.concat(this.nrows);
		nodos = nodos.concat(this.arcos);
		this.nodos = nodos;
		this.separaNodos();
		this.optimizaArcos();
	}
	
	addNodoSelf(nodo){
		console.log(utils.o2s(nodo));
		var roles = ['NROW','NCOL','ARCO'];
		if (roles.indexOf(nodo.rol) == -1) return;
		super.addNodo(nodo);
		this.separaNodos();
		this.optimizaArcos();
		console.log(utils.o2s(this.nrows),utils.o2s(this.ncols),utils.o2s(this.arcos));

	}

	addArcoSelf(arco){
		this.addNodoSelf(arco);
	}
	getNodosRow(){
		return this.nrows;
	}
	getRowByIx(ix){
		return this.nrows[ix];
	}
	getNodosCol(){
		return this.ncols;
	}
	getColByIx(ix){
		return this.ncols[ix];
	}
	getArcoByIxs(ixI,ixF){
		var ixArc = this.iArcs.indexOf(''+ixI+':'+ixF);
		return this.arcos[ixArc];
	}

	getArcos(){
		return this.arcos;
	}

	getIxFromArco(arco){
		var ixI = arco.ixI;
		var ixF = arco.ixF;
		var ixArc = this.iArcs.indexOf(''+ixI+':'+ixF);
		return ixArc;
	}
	borraArcoSelf(arco){
		var ixArc = this.getIxFromArco(arco);
		if (ixArc == -1) {console.log('Arco '+ arco.tag +' no existe!'); return;}
		this.arcos.splice(ixArc,1);
		this.regenera();
	}

	updtArcoSelf(arco){
		var ixArc = this.getIxFromArco(arco);
		if (ixArc == -1) {console.log('Arco '+ arco.tag +' no existe!'); return;}
		this.arcos[ixArc] = arco;
		this.regenera();
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = 'rMalla';
		this.separaNodos();
		this.optimizaArcos();
	}

	clase2ObjDB(){
		var nodos = [];
		nodos = nodos.concat(this.ncols);
		nodos = nodos.concat(this.nrows);
		nodos = nodos.concat(this.arcos);
		return {"meta": this.meta, "nodos" : nodos};
	}

}


export default {
	rMeta,rTopol,
	rNodo,rArco,rDrag,
	rConjt,rLista,rArbol,rGrafo,rMalla
};