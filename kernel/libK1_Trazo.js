// libK1_Trazo.js

import utils  from '../k1/libK1_Utils.js'

/*
La clase Trazo encapsula las funcionalidades para mostrar las '<div>' que representan los nodos,
y capturar los eventos del mouse sobre ellas y la '<divBase>'.
Sobre la '<divBase>' se crea un elemento '<canvas>', para trazar las lineas y flechas que se
usan para representar un grafo.

Cuando se crea Trazo, se definen las funciones que se ejecutan como respuesta a los eventos del mouse.
Tambien se detectan las pulsaciones de teclas [Ctrl] y [Shift], para modular los eventos del mouse.

Así:
	Ctrl + mousedown sobre la divBase : nuevo nodo
	Shift + mousedown sobre una div : editar nodo
	Ctrl + mousedown sobre divI + mousemove + mouseup sobre divF : nuevo arco de nodoI --> nodoF
	etc
*/

class rTrazo {
	constructor(idBase){
		this.base = utils.r$(idBase);		// <div> para el canvas
		this.isGantt = false;		// representar como Gantt
		this.lapso = false;			// periodo de tiempo del Gantt
		this.scale = null;			// escala de tiempo del Gantt

		this.drag = null;				// drag (nodo) target
		this.pntI = null;				// pos previa del cursor
		this.offset = null;			// offset de la ventana
		this.laZ = 100;				// css zIndex de las<divs>
		this.grid = null;				// forzar las divs a una cuadricula
		this.lyout = null;			// pintar lineas GRID | VERT
		this.fnDrop = null;			// función cuando Drop (mouseUp)
		this.fnKeyBase = null;		// función cuando hay una tecla y mouseDown en div Base
		this.fnKeyDivI = null;		// función cuando hay una tecla y mouseDown en un Drag
		this.fnKeyDivF = null;		// función cuando hay una tecla y mouseUp en un Drag
		this.fnDblClick = null;		// funcion cuando se hace dobleclick en el tag del drag
		this.divIdIni = null;		// id del div cuando mouseDown
		this.divIdFin = null;		// id del div cuando mouseUp
		this.canvas = null;			// elemento <canvas>
		this.setup();
	}
// Para detectar "ALT", "CTRL", "META" or "SHIFT" , use las constantes: 
// altKey, ctrlKey, metaKey or shiftKey.
// NO VA BIEN. Usamos keyCode alternativamente
	setup(){
		window.addEventListener("keydown", function (ev) {
			if (ev.defaultPrevented) {
				console.log('Prevented');
				return; // Do nothing if the event was already processed
			}
			switch (ev.keyCode) {
				case 16: utils.vgk.tecla = 'SHIFT'; break;
				case 17: utils.vgk.tecla = 'CTRL'; break;
				default: return; // Quit when this doesn't handle the key event.
			}
			ev.preventDefault();
		}, true);

		window.addEventListener("keyup",function(ev){
			utils.vgk.tecla = null;
		})

//		this.base.onmousedown = this.baseRatonDown.bind(this);
	}


	activaCanvas(){
		this.canvas = new rCanvas(this.base,this.lyout,this.scale)
	}

//------------------------------------------------------------------- Drag & Drop
	setPntI(evX,evY){
		var baseX = this.base.style.left.replace('px','');
		var baseY = this.base.style.top.replace('px','');
		var offX = window.pageXOffset;
		var offY = window.pageYOffset;

		this.offset = {x:offX-baseX,y:offY-baseY};

		var posX = this.drag.style.left.replace('px','');
		var posY = this.drag.style.top.replace('px','');

 		var pntX = evX + this.offset.x - posX ;
		var pntY = evY + this.offset.y - posY ;
		this.pntI = {x:pntX,y:pntY};
	}

	ratonMove(ev){
		ev.stopPropagation();
		ev = ev || window.event;
		var evX = ev.clientX;
		var evY = ev.clientY;
		var pntX = evX + this.offset.x - this.pntI.x;
		var pntY = evY + this.offset.y - this.pntI.y;
		this.drag.style.left = pntX+'px';
		if (!this.isGantt) this.drag.style.top  = pntY+'px';
	}

	divRatonUp(ev){
		ev.stopPropagation();
		if (utils.vgk.tecla && this.fnKeyDivF){ this.fnKeyDivF(utils.vgk.tecla,ev.target.id);return };
		if (this.grid){
			ev = ev || window.event;
			var evX = ev.clientX;
			var evY = ev.clientY;
			var pntX = evX + this.offset.x - this.pntI.x;
			var pntY = evY + this.offset.y - this.pntI.y;
			pntX = Math.floor(pntX/this.grid)*this.grid;
			pntY = Math.floor(pntY/this.grid)*this.grid;
			this.drag.style.left = pntX+'px';
			this.drag.style.top  = pntY+'px';
		}
 		this.base.onmousemove = null;
		if (this.fnDrop) this.fnDrop(this.drag);
	}
	divRatonDown(ev){
		ev.stopPropagation();
		if (utils.vgk.tecla && this.fnKeyDivI){ 
			this.fnKeyDivI(utils.vgk.tecla,ev.target.id);return 
		};
		ev = ev || window.event;
		this.drag = ev.target;
		this.drag.style.zIndex = this.laZ++;
		var evX = ev.clientX;
		var evY = ev.clientY;
		this.setPntI(evX,evY);
		this.base.onmousemove = this.ratonMove.bind(this);
//		this.base.onmouseup = this.ratonUp.bind(this);
	}

	baseRatonDown(ev){
		console.log('!!!');
//		ev.stopPropagation();
		if (utils.vgk.tecla && this.fnKeyBase){
			ev = ev || window.event;
			var evX = ev.clientX;
			var evY = ev.clientY;
			var baseX = this.base.style.left.replace('px','');
			var baseY = this.base.style.top.replace('px','');
			var offX = window.pageXOffset;
			var offY = window.pageYOffset;
			var offset = {x:offX-baseX,y:offY-baseY};

	 		var pntX = evX + offset.x;
			var pntY = evY + offset.y;

			this.fnKeyBase(utils.vgk.tecla,pntX,pntY) ;
		}
	}
	updateDivNodo(nodo){
		utils.r$(''+nodo.id0).innerHTML = nodo.tag;
	}
	addDivNodo(nodo){
		var div = document.createElement('div');
		div.id = ''+nodo.id0;
		div.className = nodo.iam;

		div.style.left  = nodo.dim.x + 'px';
		div.style.top   = nodo.dim.y + 'px';
		div.style.width = nodo.dim.w + 'px';
		div.style.height= nodo.dim.h + 'px';
		div.style.lineHeight= nodo.dim.h + 'px';

		div.style.zIndex = this.laZ++;
		div.title = nodo.tag;

		var tit = document.createElement('span');
		tit.innerHTML = nodo.tag;
		tit.ondblclick = this.fnDblClick.bind(this);
		div.appendChild(tit);
		
		div.onmouseup = this.divRatonUp.bind(this);
		div.onmousedown = this.divRatonDown.bind(this);
		
		this.base.appendChild(div);

	}

	addDivTask(task){
		var esc = this.scale;
		var div = document.createElement('div');
		div.id = ''+task.id0;
		div.className = task.iam;
		div.title = task.tag;

		div.style.left  = Math.round((task.dim.x)/(esc||1)) + 'px';
		div.style.top   = task.dim.y + 'px';
		div.style.width = Math.round(task.dim.w/(esc||1)) + 'px';
		div.style.height= task.dim.h + 'px';
		div.style.lineHeight= task.dim.h + 'px';
		console.log('style: '+div.style.left+':'+div.style.top+':'+div.style.width+':'+div.style.height);
		div.style.zIndex = this.laZ++;
//		div.innerHTML = '<small>'+task.tag+'</small>';

		div.onmouseup = this.divRatonUp.bind(this);
		div.onmousedown = this.divRatonDown.bind(this);
		this.base.appendChild(div);

	}

	borraDiv(id){
		this.base.removeChild(utils.r$(id));
	}
	clearDivsNodo(){
		var divs = this.base.getElementsByTagName('DIV');
		if (divs.length){
			for (var i=0;i<divs.length;i++)
				this.base.removeChild(divs[i]);
			}
	}
	showNodosGrafo(nodos){
		var n = nodos.length;
		for (var i=0;i<n;i++){
			var nodo = nodos[i];
			this.addDivNodo(nodo);
		}
		this.base.onmousedown = this.baseRatonDown.bind(this);
	}
	showTasksGantt(tasks){
		var n = tasks.length;
		for (var i=0;i<n;i++){
			var task = tasks[i];
			this.addDivTask(task);
		}
		this.base.onmousedown = this.baseRatonDown.bind(this);
	}

}

//=================================================================== Canvas

class rCanvas {
	constructor(base,lyout,scale){
		this.lyout = lyout;
		this.scale = scale;
		this.marcas = [];
	   this.cntxt = '';
	   this.ancho = '';
	   this.alto = '';
		this.flecha = {l:15,a:5};  // largo y ancho/2
		this.centro = {x:0,y:0};
	   this.setCanvas(base);
	}

	setCanvas(base){
		console.log('base:', base);
		var canvas = document.createElement('canvas');
		canvas.width = base.scrollWidth;
		canvas.height = base.scrollHeight;
		canvas.style.width = base.scrollWidth+'px';
		canvas.style.height = base.scrollHeight+'px';
		canvas.style.overflow = 'visible';
		canvas.style.position = 'absolute';
		canvas.style.zOrden = 1;
		
		base.appendChild(canvas);
		
		this.cntxt = canvas.getContext("2d");
		this.ancho = base.scrollWidth;
		this.alto = base.scrollHeight;
		}


//------------------------------------------------------------------- Flecha
/*	
La flecha es un triangulo isosceles A,B,C. siendo AB=BC
Con la altura desde B = largo, y la base (A-C) = ancho
El vertice A está situado en x=0, y=-ancho/2
El vertice B está situado a x=largo, y=0
El vertice C está situado a x=0, y=-ancho/2

Ej:	Para una flecha de 8px de largo y 6px de ancho 
Los vertices serían: A:[0,-3],B:[8,0],C:[0,3];
(se pone +0.5 para centrar en el pixel)
Para rotar un angulo 'ang':
	A.x = 0*Math.cos(ang)-3*Math.sin(ang);
	A.y = 0*Math.sin(ang)+3*Math.cos(ang);

	B.x = 8*Math.cos(ang)-0*Math.sin(ang);
	B.y = 8*Math.sin(ang)+0*Math.cos(ang);

	C.x = 0*Math.cos(ang)+3*Math.sin(ang);
	c.y = 0*Math.sin(ang)-3*Math.cos(ang);

	Se eliminan los términos con CERO
*/
	rotacion(ang){

		var fl = this.flecha.l; // largo
		var fa = this.flecha.a; // ancho/2

		var A={}, B={}, C={};
		A.x = Math.round(-fa * Math.sin(ang));
		A.y = Math.round( fa * Math.cos(ang));
		B.x = Math.round( fl * Math.cos(ang));
		B.y = Math.round( fl * Math.sin(ang));
		C.x = Math.round( fa * Math.sin(ang));
		C.y = Math.round(-fa * Math.cos(ang));

		var punts = [A,B,C];
		return punts;
	}

	traslacion(pts){
		var A = pts[0];
		var B = pts[1];
		var C = pts[2];

		var c = this.centro;

		A.x = A.x+c.x;
		A.y = A.y+c.y;

		B.x = B.x+c.x;
		B.y = B.y+c.y;

		C.x = C.x+c.x;
		C.y = C.y+c.y;

		return [A,B,C];
	}


	calculaFlecha(x0,y0,x1,y1){

		var dx = x1 - x0;
		var dy = y1 - y0;

		var ang = Math.atan(dy/dx);
		if (dx < 0) ang += Math.PI; // presevar sentido nodo0 --> nodo1
//		console.log('dx: '+dx+' dy: '+dy+' ang: '+ang);

		var punta = this.rotacion(ang);
		punta = this.traslacion(punta);

		return punta;

	}

	flechaHoriz(x0,y0,x1,y1){
		var fl = this.flecha.l; // largo
		var fa = this.flecha.a; // ancho/2
		var A={}, B={}, C={};

		if (x0 < x1){ // izq --> dcha
			A.x = 0; 
			A.y = -fa;
			B.x = fl;
			B.y = 0;
			C.x = 0;
			C.y = fa;
		}
		else{  // dch --> izq
			A.x = 0; 
			A.y = -fa;
			B.x = -fl;
			B.y = 0;
			C.x = 0;
			C.y = fa;
		}
		var punta = [A,B,C];
		punta = this.traslacion(punta);
		return punta;
	}

	flechaVert(x0,y0,x1,y1){
		var fl = this.flecha.l; // largo
		var fa = this.flecha.a; // ancho/2
		var A={}, B={}, C={};

		if (y0 < y1){ // arr --> abj
			A.x = -fa; 
			A.y = 0;
			B.x = 0;
			B.y = fl;
			C.x = fa;
			C.y = 0;
		}
		else{  // abj --> arr
			A.x = -fa; 
			A.y = 0;
			B.x = 0;
			B.y = -fl;
			C.x = fa;
			C.y = 0;
		}
		var punta = [A,B,C];
		punta = this.traslacion(punta);
		return punta;
	}

	pintaPunta(pts){
		var A = pts[0];
		var B = pts[1];
		var C = pts[2];

		this.cntxt.beginPath();
		this.cntxt.moveTo(A.x+0.5,A.y+0.5);
		this.cntxt.lineTo(B.x+0.5,B.y+0.5);
		this.cntxt.lineTo(C.x+0.5,C.y+0.5);
		this.cntxt.closePath();
		this.cntxt.fill();
	   this.cntxt.stroke();

	}

	calcCentro(x0,y0,x1,y1){
		this.centro.x = Math.round((x0+x1)/2);
		this.centro.y = Math.round((y0+y1)/2);
	}

	pintaFlecha(x0,y0,x1,y1){
		var punta; //[A,B,C] vértices del triangulo
		this.calcCentro(x0,y0,x1,y1);

		if (x0 == x1 && y0 == y1) return;
		else if (x0 == x1) punta = this.flechaVert(x0,y0,x1,y1);
		else if (y0 == y1) punta = this.flechaHoriz(x0,y0,x1,y1);
		else punta = this.calculaFlecha(x0,y0,x1,y1);

		this.pintaPunta(punta);
	}

	//---------------------------------------------------------------- Pinta Arcos

	pintaLinea(x0,y0,x1,y1){
		this.cntxt.beginPath();
      this.cntxt.moveTo(x0+0.5,y0+0.5);
	   this.cntxt.lineTo(x1+0.5,y1+0.5);
		this.cntxt.stroke();
	   }

	pintaArcos(dims){

		var n = dims.length;
		for (var i=0;i<n;i++){
			var dim = dims[i],
				xI = dim.i.x,
				yI = dim.i.y,
				wI = dim.i.w,
				hI = dim.i.h,
				xF = dim.f.x,
				yF = dim.f.y,
				wF = dim.f.w,
				hF = dim.f.h;
				console.log(dim);
			var 
				x0 = xI + Math.round(wI/2),
				y0 = yI + Math.round(hI/2),
				x1 = xF + Math.round(wF/2),
				y1 = yF + Math.round(hF/2);

			this.pintaFlecha(x0,y0,x1,y1);
			this.pintaLinea(x0,y0,x1,y1);

		}
	}
//------------------------------------------------------------------- Grid & Marcas
	pintaGrid(l){
		var ejeX = 0;
		var ejeY = 0;

		this.cntxt.strokeStyle='gray';
 	   this.cntxt.lineWidth = 1;
		this.cntxt.setLineDash([5, 15]);    	
		this.cntxt.beginPath();

		for (var ix=0;ix<this.ancho;ix+=l){
			for (var iy=0;iy<this.alto;iy+=l){
			   this.cntxt.rect(ix+0.5,iy+0.5,l,l);

			}
		}
		   this.cntxt.stroke();
			this.cntxt.closePath();
			this.cntxt.setLineDash([]);    	
	}

/*
Escala 1 : 1px --> 1 gr ; 1 dia = 288px
Escala 2 : 1px --> 2 gr ; 1 dia = 144px
Escala 3 : 1px --> 3 gr ; 1 dia =  96px
Escala 4 : 1px --> 4 gr ; 1 dia =  72px

Escala N : 1px --> N gr ; 1 dia = 288/N px
*/

	pintaVert(){
		var l = Math.round(30*288/this.scale);
		var ejeX = 0;
		var ejeY = 0;

		this.cntxt.strokeStyle='#cccccc';
 	   this.cntxt.lineWidth = 1;
//		this.cntxt.setLineDash([5, 15]);    	
		this.cntxt.beginPath();

		for (var ix=0;ix<this.ancho;ix+=l){
			this.cntxt.moveTo(ix+0.5,0.5);
			this.cntxt.lineTo(ix+0.5,this.alto+0.5);
		}
		   this.cntxt.stroke();
			this.cntxt.closePath();
//			this.cntxt.setLineDash([]);    	
	}

	pintaMarcas(){
		this.cntxt.font = "12px Arial";
		var ancho = Math.round(30*288/this.scale);
		var semi = Math.round(30*144/this.scale);
		this.marcas.map(function(mark,i){
			this.cntxt.strokeText(mark,ancho*i+semi,10);
		}.bind(this))
	}

	reset(){
		this.cntxt.fillStyle = 'white';

		this.cntxt.beginPath();
		this.cntxt.fillRect(0,0,this.ancho,this.alto);
	   this.cntxt.stroke();

		if (this.lyout == 'GRID' ) this.pintaGrid();
		else if (this.lyout == 'VERT' ){
			this.pintaVert();
			this.pintaMarcas();
		}

		this.cntxt.fillStyle = 'gray';
		this.cntxt.strokeStyle = 'gray';
		this.cntxt.lineWidth = 3;
		this.cntxt.lineJoin="round"
		}

}

export default {rTrazo}