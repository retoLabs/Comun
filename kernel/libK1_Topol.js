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
	Otros:
		+ {num} : para crear varios arcos entre dos nodos

	Para preservar la unicidad de id0's en una topología, el {id0} del arco:
		var id0_calc = ((id0_real + 123) ^ id1) + num;
		var id0_real = ((id0_calc ^ id1) - 123) - num;

		Nota: 123 es un número escogido arbitrariamente. 
		Diferencia {id0_calc} entre: Arcos A-->B, y Arcos B-->A

	Un NUDO es un Arco, que representa la relación entr dos Nodos en una Malla
	Siempre representa un arco de un nodo ROW a un nodo COL
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
		Malla : Nodos + Nudos (Nodos con rol = ['ROW'|'COL'], Nudos con rol = 'NUDO')

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
/*
*************** OJO !!!! Invocar new rArco con n, o peta todo !!!! **
*/
class rArco {
	constructor(tag,nodo0,nodo1,n){
		this.tag = tag || 'x';
		this.iam = 'rArco';
		this.rol = 'ARCO';
		this.num = n || 0; // para permitir varios arcos entre dos nodos dados
		if (nodo0 && nodo1){
			this.id0 = ((nodo0.id0+123) ^ nodo1.id0) + this.num; //El 123 es para diferenciar A --> B de B--> A
			this.id1 = nodo1.id0;
		}
		else {
			this.id0 = 0;
			this.id1 = 0;
		}
	}

	setNodos(nodo0,nodo1,n){
		if (nodo0 && nodo1){
			this.id0 = ((nodo0.id0+123) ^ nodo1.id0) + (n || 0); //El 123 es para diferenciar A --> B de B--> A
			this.id1 = nodo1.id0;
		}

	}
	getId0Real(){
		return ((this.id0 ^ this.id1)-123)-this.num;
	}

	otroId(){
		this.num++;
		var idReal = this.getId0Real();
		this.id0 = ((idReal+123) ^ this.id1) + this.num; //El 123 es para diferenciar A --> B de B--> A
	}

	objDB2Clase(objDB){
		this.tag = objDB.tag;
		this.iam = 'rArco';
		this.rol = 'ARCO';
		this.id0 = objDB.id0;
		this.id1 = objDB.id1;
		this.num = objDB.num;
	}
}

//------------------------------------------------------------------- Class Nudo (de Malla)
class rNudo  extends rArco{
	constructor(tag,nRow,nCol,n,valor){
		super(tag,nRow,nCol,n);
		this.iam = 'rNudo';
		this.rol = 'NUDO';
		this.num = n || 0; // para permitir varios arcos entre dos nodos dados
		this.valor = valor;
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = 'rNudo';
		this.rol = 'NUDO';
		this.valor = objDB.valor;
		this.id0I = objDB.id0I;
		this.id0F = objDB.id0F;
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

	addNodo(nodo){
		super.addNodo(nodo);
		this.optimiza(this.nodos);
	}
	swapNodos(ixa,ixb){
		console.log('swap',ixa,ixb);
		var aux = this.nodos[ixb];
		this.nodos[ixb] = this.nodos[ixa];
		this.nodos[ixa] = aux;

		this.index[ixb] = this.nodos[ixb].id0;
		this.index[ixa] = this.nodos[ixa].id0;
	}

	subeNodo (nodo){
		const N = nodo.num;
		if (N <= 0) return;
		this.swapNodos(N,N-1);
		this.nodos[N].num ++;
		this.nodos[N-1].num --;
		console.log(utils.o2s(this.index));
	}

	bajaNodo (nodo){
		const N = nodo.num;
		if (N >= this.nodos.length-1) return;
		this.swapNodos(N,N+1);
		this.nodos[N].num --;
		this.nodos[N+1].num ++;
		console.log(utils.o2s(this.index));
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
// Crear hijos y poner estados EXPAN | COLAP | FULLA
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

	expandeNodo (nodo,divBase,clases,css){
		nodo.stat = 'EXPAN';
		divBase.innerHTML = '';
		this.recorrePre(divBase,clases,css,this.nodos[0],0);

	}

	colapsaNodo (nodo,divBase,clases,css){
		nodo.stat = 'COLAP';
		divBase.innerHTML = '';
		this.recorrePre(divBase,clases,css,this.nodos[0],0);

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
		var arcos = [];
		var nodos = [];
		var index = [];

		this.nodos.map(function(nodo){
			if (nodo.rol == 'ARCO') arcos.push(nodo);
			else {
				nodos.push(nodo);
				index.push(nodo.id0);
			}
		})
		this.nodos = nodos;
		this.arcos = arcos;
		this.index = index;
	}

	optimizaArcos(){
		var arcos = [];
		var idx,id0,id1,ixI,ixF;
		this.arcos.map(function(arco,ix){
			id0 = arco.id0;
			id1 = arco.id1;
		
			ixI = this.index.indexOf(arco.getId0Real());
			ixF = this.index.indexOf(id1);
			
//			console.log(id0+'->'+id1+' | '+ixI+':'+ixF);

			if (ixI >=0 && ixF >= 0) {
				arco.nodoI = ixI;
				arco.nodoF = ixF;
				arcos.push(arco);
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

	cambiaIds(){
		this.nodos.map(function(nodo,ix){
			var ok = false;
			while (!ok){
				nodo.otroId(); // cambia el id0
				if (this.index.indexOf(nodo.id0) == -1){
					this.index[ix] = nodo.id0;
					ok = true;
				} 
			}
		}.bind(this));


		this.arcos.map(function(arco,ix){
			var id0I = this.index[arco.nodoI];
			var id0F = this.index[arco.nodoF];
			console.log('id0I:id0F ---> '+id0I+':'+id0F);
			arco.id0 = ((id0I+123) ^ id0F) + (arco.n || 0); //El 123 es para diferenciar A --> B de B--> A
			arco.id1 = id0F;
		}.bind(this))

	}

	getVecinos(nodo){
		var veins = [];
		this.arcos.map(function(arco){
			var id0Arc = arco.getId0Real();
			if (id0Arc == nodo.id0){
				var nodoF = this.getNodoById(arco.id1);
				var vei = {"n":nodoF,"a":arco};
				veins.push(vei);
			}
		}.bind(this))
		return veins;
	}
	borraNodo(nodo){
		console.log(utils.o2s(this.index));
		var ixNodo = this.index.indexOf(nodo.id0);
		if (ixNodo == -1){console.log('Nodo inexistente !!'); return false;}
		else {
			this.nodos.splice(ixNodo,1);
			var arcosOK = [];

			var n=this.arcos.length;
			for(var i=0;i<n;i++){
				var arco = this.arcos[i];
				console.log(ixNodo+':'+arco.nodoI+'-'+arco.nodoF);
				if ((arco.nodoI != ixNodo) && (arco.nodoF != ixNodo)) arcosOK.push(arco);
			}
			this.arcos = arcosOK;
			this.ajustaIndices();
			this.optimizaArcos();
		}
		console.log(utils.o2s(this.index));
	}

	borraArco(arco){
		var ixArco = this.iArcs.indexOf(arco.id0);
		if (ixArco == -1) return false;
		else {
			this.arcos.splice(ixArco,1);
			this.ajustaIndices();
		}
	}

	addArco(arco){
		var idx,id0,id1,ixI,ixF;
		id0 = arco.id0;
		id1 = arco.id1;
	
		ixI = this.index.indexOf(arco.getId0Real());
		ixF = this.index.indexOf(id1);

		if (ixI >=0 && ixF >= 0) {
			arco.nodoI = ixI;
			arco.nodoF = ixF;
			this.arcos.push(arco);
			this.iArcs.push(arco.id0);
		}
		else (console.log('Arco sin Nodo'));
	}

	getArcoById(id0){
		var ix = this.iArcs.indexOf(id0);
		if (ix == -1) return null;
		else return this.arcos[ix];
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
			var nodoI = this.nodos[arco.nodoI];
			var nodoF = this.nodos[arco.nodoF];
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
//------------------------------------------------------------------- Class Gantt
class rGantt extends rGrafo{
	constructor(nombre,nodos,lapso) {
		super(nombre,nodos);
		this.meta.iam = 'rGantt';
		this.lapso = lapso; // es el periodo representado en la gráfica
	}

	setLapso(lapso){
		this.lapso = lapso;
	}

	getLapso(){
		return this.lapso;
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB); // rGrafo
		this.meta.iam = 'rGantt';
	}
}
/*
*/
//------------------------------------------------------------------- Class Malla
// Pseudo Grafo. Los arcos van de un conjunto de nodos a otro
class rMalla extends rTopol{
	constructor(nombre,nodos){
		super(nombre,nodos);
		this.meta.iam = 'rMalla';


		this.mcols = [];
		this.mrows = [];
		this.nudos = [];

		this.iCols = [];
		this.iRows = [];
		this.iNudos = [];

		this.loTable = '';

		this.separaNodos();
		this.optimizaNudos()
	}

	separaNodos(){
		this.nodos.map(function(nodo){
			if (!nodo.rol){console.log('Nodo '+nodo.tag+' sin ROL');}
			else if (nodo.rol == 'COL') {this.iCols.push(nodo.id0); this.mcols.push(nodo);}
			else if (nodo.rol == 'ROW') {this.iRows.push(nodo.id0); this.mrows.push(nodo);}
			else if (nodo.rol == 'NUDO'){this.nudos.push(nodo);}
		}.bind(this))
	}

	optimizaNudos(){
		this.iNudos = [];
		this.nudos.map(function(nudo){
			var idx = nudo.getId0Real();
			nudo.ix0 = this.iCols.indexOf(idx);
			nudo.ix1 = this.iRows.indexOf(nudo.id1);
			this.iNudos.push(nudo.ix0+':'+nudo.ix1);
		}.bind(this))
	}

	addNodoRow(nodo){
		nodo.rol = 'ROW';
		var ix = this.iRows.indexOf(nodo.id0);
		if (ix == -1){ 
			this.mrows.push(nodo);
			this.iRows.push(nodo.id0);
		}
	}
	addNodoCol(nodo){
		nodo.rol = 'COL';
		var ix = this.iCols.indexOf(nodo.id0);
		if (ix == -1){ 
			this.mcols.push(nodo);
			this.iCols.push(nodo.id0);
		};
	}

	addNudo(nudo){
		this.nudos.push(nudo);
		this.optimizaNudos();
	}
	borraNudoSelf(nudo){
		var ix0 = nudo.ix0;
		var ix1 = nudo.ix1;
		var ixN = this.iNudos.indexOf(ix0+':'+ix1);
		if (ixN == -1) {alert('Nudo '+ nudo.tag +' no existe!'); return;}
		this.nudos.splice(ixN,1);
	}
	updtNudoSelf(nudo){
		var ix0 = nudo.ix0;
		var ix1 = nudo.ix1;
		var ixN = this.iNudos.indexOf(ix0+':'+ix1);
		if (ixN == -1) {alert('Nudo '+ nudo.tag +' no existe!'); return;}
		this.nudos[ixN] = nudo;
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = 'rMalla';
		this.separaNodos();
		this.optimizaNudos();
	}

	clase2ObjDB(){
		var nodos = [];
		nodos = nodos.concat(this.mcols);
		nodos = nodos.concat(this.mrows);
		nodos = nodos.concat(this.nudos);
		return {"meta": this.meta, "nodos" : nodos};
	}

	getGridCols(){
		var gridCols = ['Tag'];
		var n = this.mrows.length;
		for (var i=0;i<n;i++){
			gridCols.push(this.mrows[i].tag)
		}
		return gridCols;
	}

	getGridData(){
		var nudo = '';
		var gridData = [];
		var nx = this.mrows.length;
		var ny = this.mcols.length;
		for (var y=0;y<ny;y++){
			var fila = {};
			fila['Tag'] = {ix:-(y+1), valor:this.mcols[y].tag};
			for (var x=0;x<nx;x++){
				var ixNudo = this.iNudos.indexOf(y+':'+x);
				if ( ixNudo == -1) fila[this.mrows[x].tag] = 0;
				else {
					nudo = this.nudos[ixNudo];
					fila[this.mrows[x].tag]= {ix:ixNudo+1, valor:nudo.valor};
				}
			}
			gridData.push(fila);
		}
		return gridData;
	}

	setHeaders (tbl){
		var thead = rEl$('thead');
		var tr = rEl$('tr');
		var th0 =rEl$('th');
		th0.innerHTML = '&nbsp;'
		th0.style.cssText = 'border:1px solid red';
		tr.appendChild(th0);

		this.mcols.map(function(col){
			var th = rEl$('th');
			th.innerHTML = col.tag;
			th.style.cssText = 'border:1px solid black';
			tr.appendChild(th);
		}.bind(this))
		thead.appendChild(tr);
		tbl.appendChild(thead);
	}

	setCelda(idTD, valor){
		if (!idTD || !valor ) return;
		var ixNudo = this.iNudos.indexOf(idTD);
		if (ixNudo >= 0) {this.nudos[ixNudo].valor = valor;}
		else {
			var col = this.mcols[parseInt(idTD.split(':')[0])];
			var row = this.mrows[parseInt(idTD.split(':')[1])];
			var nudo = new rNudo(col,row,'Nudo '+idTD,valor);
			this.nudos.push(nudo);
			this.iNudos.push(idTD);
			}
	}

	creaTDs (row,tr){
		this.mcols.map(function(col){
			var td = rEl$('td');
			td.id = col.num +':'+row.num;
			td.style.cssText = 'border:1px solid black';
			var ixNudo = this.iNudos.indexOf(col.num+':'+row.num);
//			console.log(col.num+':'+row.num+ '->'+ixNudo);
			if (ixNudo >= 0) td.innerHTML = this.nudos[ixNudo].tag;
			else td.innerHTML = '&nbsp;';

			td.onclick = function(e){this.setCelda(e.target.id);}.bind(this);
			tr.appendChild(td);

		}.bind(this))
	}

	setTBody(tbl){
		var tBody = rEl$('tbody');
		this.mrows.map(function(row){
			var tr = rEl$('tr');
			var td0 = rEl$('td');
			td0.style.cssText = 'border:1px solid blue';
			td0.innerHTML = row.tag;
			tr.appendChild(td0);
			this.creaTDs(row,tr);
			tBody.appendChild(tr);
		}.bind(this))

		tbl.appendChild(tBody);
	}

	getTabla(){
		var tabla = document.createElement('table');
		this.setHeaders(tabla);
		this.setTBody(tabla);
		this.loTable = tabla;
		return tabla;

	}
	show (win0,clases,css){
		win0.show();
		var divBase = win0.tapa;
		var taula = rEl$('table');
//		taula.className = 'table';
		if (clases) taula.className += clases;
		if (css) taula.style.cssText = css;
		this.setHeaders(taula);
		this.setTBody(taula);
		divBase.appendChild(taula);
		this.loTable = taula;
	}
}

//------------------------------------------------------------------- Class MallaTree
// Una MALLA-Tree es un híbrido Arbol/Grafo.
// Los Nodos pertenecen a dos Listas (Rows Cols)
// Los NUDOS (~Arcos) conectan dos nodos, uno de cada lista, por su indice {num}
// La estructura básica se compone de un Arbol, con tres nodos singulares:
// Raiz : Info global de la Malla
//  +--- ROWS : Nodos cabecera de fila
//  +--- COLS : Nodos cabecera de columna
//  +--- NUDOS: Arcos entre Rows y Cols
//-------------------------------------------------------------------
class rMallaTree extends rArbol {
	constructor(tag,nodos){
		super(tag,nodos);
		this.meta.iam = 'rMallaTree';
		if (nodos.length == 1) this.inicio();
	}

	inicio(){
		var raiz = this.getRaiz();
		var rows = new rNodo('Rows'); rows.rol = 'ROWS';
		var cols = new rNodo('Cols'); cols.rol = 'COLS';
		var nudos = new rNodo('Nudos'); nudos.rol = 'NUDOS';

		this.addNodoHijo(raiz,rows);
		this.addNodoHijo(raiz,cols);
		this.addNodoHijo(raiz,nudos);
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = 'rMallaTree';
	}

	getNodoByRol(rol){
		var nodox = null;
		var raspa = this.getRaspa();
		raspa.map(function(nodo){
			if (nodo.rol == rol ) nodox = nodo; 
		}.bind(this))
		return nodox;
	}
	addNodoRow(nodox){
		var nodoRows = this.getNodoByRol('ROWS');
		if (nodoRows && nodoRows.hijos.indexOf(nodox.id0) == -1) {
			this.addNodoHijo(nodoRows,nodox);
//			console.log('addNodoRow '+utils.o2s(nodox))
		}
		else if (nodoRows && nodoRows.hijos.indexOf(nodox.id0) > -1)
			console.log ('Nodo Row 2 : '+nodox.tag+' ya existe');
	}

	getNodosRows(){
		var rows = [];
		var nodoRows = this.getNodoByRol('ROWS');
		if (nodoRows) rows = this.getHijosNodo(nodoRows);
		return rows;
	}

	addNodoCol(nodox){
		var nodoCols = this.getNodoByRol('COLS');
		if (nodoCols && nodoCols.hijos.indexOf(nodox.id0) == -1) {
			this.addNodoHijo(nodoCols,nodox);
//			console.log('addNodoCol '+utils.o2s(nodox))
		}
		else if (nodoCols && nodoCols.hijos.indexOf(nodox.id0) > -1)
			console.log ('Nodo Col '+nodox.tag+' ya existe');
	}

	getNodosCols(){
		var cols = [];
		var nodoCols = this.getNodoByRol('COLS');
		if (nodoCols) cols = this.getHijosNodo(nodoCols);
		return cols;
	}

	addNudo(nudo){
		nudo.rol = 'NUDO';
		var nodoNudos = this.getNodoByRol('NUDOS');
		if (!nodoNudos) return null;

		var iNus = nodoNudos.hijos.indexOf(nudo.id0);

		if (iNus == -1){ 
			nudo.id0I = nudo.getId0Real();
			nudo.id0F = nudo.id1; // el id1 actual se 'machaca' al hacer addNodoHijo
			this.addNodoHijo(nodoNudos,nudo);
//			console.log('addNudo '+utils.o2s(nudo))
		}
		else if (iNus > -1){
//			console.log ('Nudo '+nudo.tag+' ya existe');
		}
		return iNus;
	}

// Al borrar un nudo, comprueba si los nodos COL y ROW tienen otros nudos que les apunten.
// Si no es así, se eliminan estos nodos 'inútiles'
	borraNudo(nudox,onOff){
		var nodoNudos = this.getNodoByRol('NUDOS');
		if (nodoNudos && nodoNudos.hijos.indexOf(nudox.id0) == -1){ 
			console.log ('Nudo '+nudox.tag+' NO existe');
		}
		else {
			var colComun = 0;
			var rowComun = 0;
			var nudos = this.getNudos();
			nudos.map(function(nudo){
//				console.log('BorraNudo: ' + utils.o2s(nudo));
				if (nudo.id0I == nudox.id0I) rowComun++;
				if (nudo.id0F == nudox.id0F) colComun++;
			})

			if (onOff && colComun == 1) {
				var col = this.getNodoById(nudox.id0F);
				this.borraNodo(col);
			}
			if (onOff && rowComun == 1) {
				var row = this.getNodoById(nudox.id0I);
				this.borraNodo(row);
			}

			this.borraNodo(nudox);
		}
	}

	getNudos(){
		var nudos = [];
		var nodoNudos = this.getNodoByRol('NUDOS');
		if (nodoNudos && nodoNudos.hijos.length) nudos = this.getHijosNodo(nodoNudos);
		return nudos;
	}

	getNudoByIds(id0,id1){
		var nudos = this.getNudos();
		var nudox = null;
		nudos.map(function(nudo){
			var ok = (nudo.id0I == id0) && (nudo.id0F == id1);
			if (ok) nudox = nudo;
		})
		return nudox;
	}

	getMatrizVue(onOff){
		var cols = this.getNodosCols();
		var rows = this.getNodosRows();

		var filas = [];
		var raiz = this.getRaiz();
		var fila = [raiz.tag]; // celda 0,0 de la tabla

		for (var x=0;x<cols.length;x++){
			fila.push(cols[x].tag); // celdas 0,x --> thead
		}
		filas.push(fila);

		for (var y=0;y<rows.length;y++){
			fila = [rows[y].tag]; // celda y,0 con el tag de cada fila0
			for (var x=0;x<cols.length;x++){
				var nudo = this.getNudoByIds(rows[y].id0,cols[x].id0)

				     if ( nudo &&  onOff) fila.push('<i class="fa fa-check"></i>');
				else if ( nudo && !onOff) fila.push(nudo.tag); // 
				else if (!nudo &&  onOff) fila.push('<i class="fa fa-times"></i>');
				else fila.push(' ');
			}
			filas.push(fila);
		}

		return filas;
	}
}

export default {
	rMeta,
	rNodo,rDrag,rNudo,rArco,
	rTopol,rConjt,rLista,rArbol,rGrafo,
	rMalla,rMallaTree
};