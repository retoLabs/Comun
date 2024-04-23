
/* 
	Para tratar los aspectos de Fechas, y en general, de periodos de tiempo (Lapsos), 
	en RETO se usa la clase rLapso, que tiene dos componentes: {uta} y {tau}
	{uta} entero que representa el momento de inicio del período
	{tau} entero que representa la duración del periodo

	Matemáticamente los Lapsos los podemos asimilar a vectores unidimensionales
	Esto permite operaciones tales como Intersección, Unión, Diferencia, etc etc

	Tanto {uta} como {tau} se miden en GRANOS
	1 GRANO = 5 minutos aprox. (No tiene en cuenta los segundos intercalares)

	Si {uta} == null y {tau} == null, significa un lapso nulo o inválido
	Si {uta} != null y {tau} == null, significa una fecha (instante, sin duración)
	Si {uta} == null y {tau} != null, significa un periodo de tiempo
	Si {uta} != null y {tau} != null, significa una fecha de inicio y una fecha final

	El tiempo UNIX = milisegundos desde 01/01/1970
	El tiempo RETO = GRANOS(uta) desde 01/01/2000 + GRANOS(tau)

	MSGAP es la diferencia entre origen del Tiempo-UNIX y origen del Tiempo-RETO(uta)
	O sea : la cantidad de milisegs entre 01/01/1970H00:00:00 y 01/01/2000H00:00:00

	Las constantes GRANO y MSGAP se definen en libK1_Utils (utils.vgk.GRANO y utils.vgk.MSGAP)

*/

import utils from '../k1/libK1_Utils.js'
import topol from '../k1/libK1_Topol.js'

var tau_dias = [
		12,12,12,12,12,13,13,13,13,13,14,14,14,15,15,15,15,16,16,16,17,17,18,18,18,19,19,20,20,20,
		21,21,22,22,23,23,23,24,24,25,25,26,26,27,27,28,28,29,29,30,30,31,31,32,32,33,33,34,34,35,
		35,36,37,37,38,38,39,39,40,40,41,41,42,42,43,44,44,45,45,46,46,47,47,48,48,49,49,50,51,51,
		52,52,53,53,54,54,55,55,56,56,57,57,58,58,59,59,60,60,61,61,62,62,63,63,64,64,65,65,66,66,
		67,67,68,68,68,69,69,70,70,71,71,71,72,72,73,73,73,74,74,74,75,75,75,76,76,76,77,77,77,77,
		78,78,78,78,79,79,79,79,79,79,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,80,
		80,80,80,79,79,79,79,79,79,78,78,78,78,77,77,77,77,76,76,76,75,75,75,74,74,74,73,73,73,72,
		72,71,71,71,70,70,69,69,69,68,68,67,67,66,66,65,65,64,64,63,63,63,62,62,61,61,60,60,59,59,
		58,58,57,57,56,55,55,54,54,53,53,52,52,51,51,50,50,49,49,48,48,47,47,46,46,45,44,44,43,43,
		42,42,41,41,40,40,39,39,38,38,37,37,36,35,35,34,34,33,33,32,32,31,31,30,30,29,29,28,28,27,
		27,26,26,25,25,25,24,24,23,23,22,22,21,21,21,20,20,19,19,18,18,18,17,17,17,16,16,16,15,15,
		15,14,14,14,14,13,13,13,13,12,12,12,12,12,12,12,11,11,11,11,11,11,11,11,11,11,11,11,11,11,
		11,11,11,11,12
		];
//------------------------------------------------------------------- Class Lapso
export class rLapso {
	constructor(uta,tau){
		this.uta = uta;
		this.tau = tau;
	}

	objDB2Clase(objDB){
		this.uta = objDB.uta;
		this.tau = objDB.tau;
	}

	granos2Date(granos){
		var milisReto = granos * utils.vgk.GRANO;
		var milisUnix = milisReto + utils.vgk.MSGAP;
		return new Date(milisUnix);
	}

	toDateI(){
		if (!this.uta) return null;
		return this.granos2Date(this.uta);

	}

	toDateF(){
		if (!this.tau) return null;
		return this.granos2Date(this.uta + this.tau);

	}
	toStr_I(format){
		console.log('Entra');
		if (!this.uta) return null;
		var fecha = this.toDateI();
		var dia = fecha.getDate();
		var mes = fecha.getMonth()+1;
		var jar = fecha.getFullYear();
		console.log('Sale');
		if (format && format.toLowerCase() == 'yyyy-mm-dd') return jar+'-'+mes+'-'+dia;
		else  return dia+'/'+mes+'/'+jar;
	}

	toStr_F(format){
		if (!this.tau) return null;

		var fecha = this.toDateF();
		var dia = fecha.getDate();
		var mes = fecha.getMonth()+1;
		var jar = fecha.getFullYear();
		if (format.toLowerCase() == 'yyyy-mm-dd') return jar+'-'+mes+'-'+dia;
		else  return dia+'/'+mes+'/'+jar;
	}

	fromDates(dateI,dateF){
		this.uta = Math.floor((dateI.getTime() - utils.vgk.MSGAP) / utils.vgk.GRANO);
		if (dateF) this.tau = Math.floor((dateF - dateI) / utils.vgk.GRANO);
		else this.tau = null; // cuando es un instante, no un lapso

	}

}


//------------------------------------------------------------------- Class Almanaque
class rJar extends topol.rNodo{
	constructor(tag){
		super(tag);
		this.iam = 'rJar';
		this.obj = {
			lapso : getLapsoByJar(parseInt(tag))
		}
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = 'rJar';
		var lapso = new rLapso();
		lapso.objDB2Clase(objDB.obj.lapso);
		this.obj.lapso = lapso;
	}
}
//=================================================================== Calendarios
//------------------------------------------------------------------- Dia del mes
export class rDia extends topol.rNodo{
	constructor(tag,dia,mes,jar){
		super(tag);
		this.iam = 'rDia';
		this.obj = {
			retol : '',
			tasks : 0,
			dd : ''+dia+'/'+mes+'/'+jar, // fecha d/m/a
			dS : zeller(dia,mes,jar),  // dia semana
			dJ : diaJar(dia,mes,jar),  // dia del año
			fL : null, // Fase lunar (0-27)
			dF : 'LAB', // Tipo dia (LAB|DOM|LOC|AUT|NAC|ESP), para clases CSS .LAB .DOM etc
			hL : horasLuz(diaJar(dia,mes,jar)), //Horas de luz (orto-ocaso)
		}
		if ( this.obj.dS == 6) this.obj.dF = 'DOM';
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = 'rDia';
		this.obj = objDB.obj;
	}

	fromLapso(lapso){
		if (!lapso.uta) return null;
		var fecha = lapso.toDateI();
		var dia = fecha.getDate();
		var mes = fecha.getMonth()+1;
		var jar = fecha.getFullYear();
		this.obj.dd = ''+dia+'/'+mes+'/'+jar;
		this.obj.dS = zeller(dia,mes,jar);
		this.obj.dJ = diaJar(dia,mes,jar);
		if ( this.obj.dS == 6) this.obj.dF = 'DOM';
		return this;
	}

	vale(conds){
		conds.valid.tag.ok =  utils.inputOK('INT',this.tag);
		return conds;
	}
}

//------------------------------------------------------------------- Kronos

/*
Calcular los dias de la semana por el número de semana del año (s)
En principio, los DIAS = numSem * 7, si 1-Ene es Lunes
Si no, hay que buscar el gap por medio del {dS} del 1-Ene
DIAS apunta al domingo de la semana

Para encontrar el mes, iteramos por los nodos-mes (Raspa)
Se van acumulando los dias de cada mes (mes.hijos.length) hasta que superan a DIAS
Una vez tenemos el mes, buscamos el dia 1 (d1).
Si la diferencia entre el dJ y DIAS > 7, la semana entera está en el mes
En otro caso, la semana está entre dos meses
Siempre nos da en el mes que tiene el domingo
Entonces tenemos que complementar con dias del mes anterior, por medio del dS del d1

Casos singulares : 
	+ primera semana de Enero : los dias que faltan (del año anterior) salen en blanco
	+ última semana de Diciembre : puede salir semana 53. 
	Por eso, en el html ponemos {{item.W % 52}}, y sale 1, (como en los almanaques de papel)
	Los dias que falten (del año posterior, salen en blanco)
*/

class rKronos extends topol.rArbol{
	constructor (tag,nodos,jar,tagsMM){
		super(tag,nodos);
		this.meta.iam = 'rKronos';
		this.jar = jar;
		this.mes = null;
		this.tagsMM = tagsMM;
		if (!nodos.length) this.initDias();
	}

	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = 'rKronos';
	}

	initDias(){
		var jar = new rJar(''+this.jar);
		this.addNodo(jar);
		this.optimiza(this.nodos); // por ser un rArbol

		this.tagsMM.map(function(tag,ix){
			var mes = new topol.rNodo(tag);
			this.addNodoHijo(jar,mes);
			this.addDias2Mes(mes,(ix+1));
		}.bind(this))
	}

	addDias2Mes(nodoMes,numMes){
		var numDias = diasEnMes(numMes,this.jar);
		for (var i=1;i<numDias+1;i++){
			var dia = new rDia(''+i,i,numMes,this.jar);
			dia.obj.fL = faseLunar(i,numMes,this.jar);
			if (!dia.obj.fL) dia.obj.fL = 29;
			this.addNodoHijo(nodoMes,dia);
		}
	}

	getGapJar(){
		var raspa = this.getRaspa();
		var ene = raspa[0];

		var d1E = this.getNodoById(ene.hijos[0]); // dia 1 de enero
		var gap = d1E.obj.dS; // dia de la semana 1-ene.
		return gap;
	}

	getDiasMes(m){
		var raspa = this.getRaspa();
		var mes = raspa[m];
		var dias = this.getHijosNodo(mes);
		return dias;
	}	
	getDiasSem(s){
		var dias = [];
		var idsJar = [];
		var raspa = this.getRaspa();
		var gap = this.getGapJar();
		for (var i=0;i<gap;i++){idsJar.push(null);}  // rellena con dias vacios

		raspa.map(function(mes){
			idsJar = idsJar.concat(mes.hijos);
		})
		var idsSem = idsJar.slice((s-1)*7,(s-1)*7+7); // toma 7 dias a partir de s*7, sean del mes que sean
		idsSem.map(function(id0){
			if (id0){
				var dia = this.getNodoById(id0);
				dias.push(dia);
			}
		}.bind(this))
		return dias;
	}
}

//------------------------------------------------------------------- KAIROS
// La clase Kairos representa los acontecimientos en el tiempo
// Similar a los layers de Map,
// Un Almanaque = Kronos + 1|N capas de Kairos.

class rKairos extends topol.rArbol {
	constructor(tag,nodos){
		super(tag,nodos);
		this.meta.iam = 'rKairos';
		this.iDias = [];
		this.inicio();
	}

	inicio(){
		this.nodos.map(function(nodo){
			if (nodo.iam == 'rDia')	this.iDias.push(nodo.obj.dd);
		}.bind(this))
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.meta.iam = 'rKairos';
		this.inicio();
	}

/*
Para obtener los dias en orden creciente, ordenamos por dia absoluto:
(jar*1000+ mm)*100 + dd. Ej: 1/2/2022 --> (2022*100+2)*100 + 1 = 20220201
y sustituimos el array [hijos] de la raiz por los id0 de los nodos ordenados por dJ
*/
	ddAbs(dd){
		var jar = parseInt(dd.split('/')[2]);
		var mes = parseInt(dd.split('/')[1]);
		var dia = parseInt(dd.split('/')[0]);
		return (jar*100+mes)*100 +dia;
	}
	sortRaspa(){
		var sortedIds = []; 
		var nodos = this.getRaspa();
//		nodos.sort((a, b) => (''+a.obj.dJ).localeCompare(''+b.obj.dJ));
		nodos.sort((a, b) => (this.ddAbs(a.obj.dd) < this.ddAbs(b.obj.dd)) ? -1 : 1);
		nodos.map(function(nodo){
			sortedIds.push(nodo.id0);
		})
		var raiz = this.getRaiz();
		raiz.hijos = sortedIds;
	}

	upsertDia(dia){
		var ix = this.iDias.indexOf(dia.obj.dd);
		console.log('upsertDia',ix,utils.o2s(dia));
		if (ix == -1){
			this.iDias.push(dia.obj.dd);
			var raiz = this.getRaiz();
			this.addNodoHijo(raiz,dia);
		}
		else this.nodos[ix] = dia;// para edición desde calendario
	}
	removeDia(dia){
		console.log(dia);
		var ix = this.iDias.indexOf(dia.obj.dd);
		console.log('Remove '+dia.obj.dd+' : '+ix+':'+this.iDias.length);
		if (ix == -1) return;
		else this.iDias.splice(ix,1);
		this.borraNodo(dia);
	}

}

// Los nodos de Kairos se denominan Cron.
// Por defecto tienen un lapso, un código de festivo y un retol
// Se crean y se editan desde calendario.html ó similar
// Al visualizar un almanaque, en cada dia hay una lista de crons como hijos del dia
// Y si hay crons que solapan más de un dia ???????????????????

// Para definir lapsos repetitivos en el tiempo
// Ej : para definir el mes de marzo de cada año 
// var cron = new rCron(0,3,0,0);
// var mes = cron.getLapso(2018);
class rCronOLD {
	constructor(dia,mes,D,tau){
		this.dia = dia;  // 1-31
		this.mes = mes; // 1-12
		this.D = D;  // 1-7
		this.tau = tau; // duración del periodo
	}

	getLapso(base){
		var lpsCron = new rLapso(0,-1);
		var f1 = new Date(base,this.mes-1,1);

		if (!this.tau) {
			var f2 = new Date(base,this.mes,1);
			lpsCron.fromDates(f1,f2);
		} 
		else {
			lpsCron.fromDates(f1,f1);
			lpsCron.tau = this.tau;
		}

		return lpsCron;

	}
}

export class rCron extends topol.rNodo {
	constructor(tag){
		super(tag);
		this.iam = 'rCron';
		this.obj = {
			lapso : null,
			fest :'NAC',
			retol:'Agro'
		}
	}
	objDB2Clase(objDB){
		super.objDB2Clase(objDB);
		this.iam = 'rCron';
		this.obj = objDB.obj;

		var l = new rLapso(objDB.obj.lapso.uta,objDB.obj.lapso.tau);
		this.obj.lapso = l;
	}
}
//------------------------------------------------------------------- Funciones Date en JS
/* Ejemplos de funciones con Date

function daysInMonth(humanMonth, year) {
	return new Date(year || new Date().getFullYear(), humanMonth, 0).getDate();
}

function isValidDate(dateString){
	
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};

*/

//------------------------------------------------------------------- Funciones auxiliares
// Calculos Fase Lunar
function epacta(jar){
	var na = (jar+1) % 19; // Número áureo

	var epacta = ((na-1) * 11) % 30;
	return epacta; 
}

function faseLunar(dia,mes,jar){
	var ep = epacta(jar);
	var faseLunar = (ep + (mes-3)+dia) % 30; // valor de la luna visible
	return faseLunar;
}
/*
	Calculos religiosos;

		Domingo de Pascua (DP), 
		Miércoles de ceniza: DP-46, 
		Domingo de Ramos: DP-7, 
		Jueves Santo: DP-3
		Viernes Santo: DP-2, 
		Ascensión: DP+39, 
		Pentecostés: DP+49, 
		Santísima Trinidad: DP+56 
		Corpus Christi: DP+60 
*/
function pasqa(jar) {
	var dia,mes,a,b,c,d,e,f,M,N;
	if      (jar>1583 && jar<1699) { M=22; N=2; } 
	else if (jar>1700 && jar<1799) { M=23; N=3; } 
	else if (jar>1800 && jar<1899) { M=23; N=4; } 
	else if (jar>1900 && jar<2099) { M=24; N=5; } 
	else if (jar>2100 && jar<2199) { M=24; N=6; } 
	else if (jar>2200 && jar<2299) { M=25; N=0; } 
	else return null;

	a = jar % 19;
	b = jar % 4;
	c = jar % 7;
	d = ((19*a) + M) % 30;
	e = ((2*b) + (4*c) + (6*d) + N) % 7;
	f = d + e;
	if (f < 10) { 
		dia = f + 22;
		mes = 3;
	} else  {
		dia = f - 9;
		mes = 4;
	};
	if (dia == 26 && mes == 4){ 
		dia = 19;
	};
	if (dia == 25 && mes == 4 && d == 28 && e == 6 && a > 10){
		dia = 18;
	};
	
	var pasqua = new Date(jar,mes-1,dia);
	return pasqua;
};

//------------------------------------------------------------------- 
// Basado en la congruencia de Zeller
// Zeller original Retorna 0:Sab, 1:Dom, 2:Lun, ... 6:Vie
// Manipulamos para que 0:Lun, 1:Mar, ... 6:Dom
function zeller(dia, mes, jar) {

	if (mes < 3){
		mes += 12;
		jar--;
	}

	var k = jar % 100;
	var j = Math.floor(jar/100);

	var g = dia;
	g +=  Math.floor(13*(mes+1)/ 5);
	g += k;
	g += Math.floor(k/4);
	g += Math.floor(j/4);
	g -= 2 * j;

	g = g % 7;

	if(g < 0){ g += 7;}  // original

	if (g < 2) g += 5;  // manipulado
	else g -= 2;

	return g;
}


// Verifica si un string es una fecha válida
// se espera un string con formato d[d]/m[m]/yyyy 
function esFechaValida(ddmmyyyy){
	
	if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(ddmmyyyy)) return false;

	var partes = ddmmyyyy.split("/");
	var dia = parseInt(partes[0], 10); 
	var mes = parseInt(partes[1], 10); // mes : [1-12]
	var jar = parseInt(partes[2], 10);

	var ult = diasEnMes(mes,jar);  // ultimo dia del mes

	return dia > 0 && dia <= ult; // si dia =< 0 || ult == 0, devolverá false
};

// Un año es bisiesto si es divisible por 4 o por 400, excepto
// Si es divisible por 100
function isLeapJar(jar){
	if(( jar % 400 == 0 || jar % 4 == 0) && (jar % 100 != 0)) return true;
	else return false;
}


function diasEnMes(mes,jar){
	var dias = 0;

	if (mes > 12 || mes < 1){console.log(mes + 'No es un mes válido'); return dias;}
	if (jar > 9999 || jar < 1000){console.log(jar + 'No es un año válido'); return dias;}

	switch(mes){
		case 1:
		case 3:
		case 5:
		case 7:
		case 8:
		case 10:
		case 12 :
			dias = 31;
			break;

		case 4:
		case 6:
		case 9:
		case 11 : 
			dias = 30;
			break;

		case 2:
      	if (isLeapJar(jar)) dias = 29;
      	else  dias = 28;
         break;
	}
	return dias;
}


function diaJar (dia,mes,jar){
	if (!esFechaValida(''+dia+'/'+mes+'/'+jar)) return 0;

	var numDia = dia;
	for (var i=1;i<mes;i++){
		numDia += diasEnMes(i,jar);
	}
	return numDia;
}

function horasLuz(dJ){
	return tau_dias[dJ]+100;
}
function strES2Date(ddmmyyyy){
	var ok = esFechaValida(ddmmyyyy);
	if (!ok) return null;

	var partes = ddmmyyyy.split("/");
	var dia = ('00'+partes[0]).slice(-2);
	var mes = ('00'+ partes[1]).slice(-2);
	var jar = partes[2];

	var ISO8601 = jar +'-'+ mes +'-'+ dia;
//	console.log('ISO: '+ISO8601);

	var date = new Date(ISO8601);
	return date;
}

function diasDiffDates(dateI,dateF){
	var diff = dateF - dateI;
	var ss = Math.round(diff /1000);
	var mm = Math.round(ss/60);
	var hh = Math.round(mm/60);
	var dd = Math.round(hh/24);
	return dd;
}

// se esperan 2 strings con formato dd/mm/yyyy
function fechas2Lapso(strFI,strFF){
	var dateI = strES2Date(strFI);
//	console.log('dateI: '+dateI);
	var dateF = strES2Date(strFF);
//	console.log('dateF: '+dateF);

	if (isNaN(dateI) || isNaN(dateF)) return null;

	var lapso = new rLapso(null,null);
	lapso.fromDates(dateI,dateF);
	return lapso;
}


// Calcula un Lapso que abarca un año completo
function getLapsoByJar(jar){
	var ISO8601 = '01 Jan '+ jar +' 00:00:00 GMT';
	var milis = Date.parse(ISO8601);
	if (isNaN(milis)){ alert('Fecha errónea'); return null;}
	var uta = (milis - utils.vgk.MSGAP)/ utils.vgk.GRANO;

	var bisiesto = isLeapJar();
	var dias = (bisiesto) ? 366 : 365;

	var tau = 288 * dias; // granos de un dia x num dias del año
	var lapso = new rLapso(uta,tau);
//	console.log('Jar '+jar+': '+milis +' : '+ JSON.stringify(lapso));
	return lapso;
}


// Obtiene los lapsos correspondientes a los meses (o parte de ellos)
// comprendidos en el lapso global
function getMesesByLapso(lapsoG){

	console.log('Periodo: ' + JSON.stringify(lapsoG));
	var lapsos = [];
	var lapso;
	var msI = lapsoG.uta * utils.vgk.GRANO + utils.vgk.MSGAP; // miliseg Ini LapsoG
	var dateI = new Date(msI);
	console.log('Fecha I: '+dateI);

	var msF = (lapsoG.uta + lapsoG.tau) * utils.vgk.GRANO + utils.vgk.MSGAP; // miliseg Fin LapsoG
	var dateF = new Date(msF);
	console.log('Fecha F: '+dateF);

	var nMesI = dateI.getMonth(); // num mes Ini (0-11)
	var nJarI = dateI.getFullYear(); // 4 digitos año Ini
	var nUltI = diasEnMes(nMesI+1,nJarI); // num de dias del mes Ini
	var ISO8601 = ''+nJarI+'-'+(nMesI+1)+'-'+nUltI;
	console.log('ISO: ' + ISO8601);
	var fUltI = new Date(ISO8601); // fecha ultimo dia del mes Ini

	console.log('ISO: ' + ISO8601+':'+fUltI.toDateString());

	var vueltas = 12; // provisional, para pruebas

	console.log('Diff: ' + diasDiffDates(fUltI,dateF)+ ' dias');
	while (diasDiffDates(fUltI,dateF) > 2){

		lapso = new rLapso(0,-1);
		lapso.fromDates(dateI,fUltI);
		lapsos.push(lapso);

		dateI = new Date(fUltI.getFullYear(), fUltI.getMonth()+1,1);
		fUltI = new Date(dateI.getFullYear(), dateI.getMonth()+1, 0);
		console.log('desde: '+ dateI+' hasta:'+ fUltI);
		console.log('Diff: ' + diasDiffDates(fUltI,dateF)+ ' dias');
		if (fUltI > dateF) console.log('FIN !!!');

		vueltas --;
		if (!vueltas) break; // para prevenir loops infinitos
	}

	return lapsos;
}


function getDiasByLapso(lapso){
//	console.log('Lapso: '+utils.o2s(lapso));
	var dias = [];
	var dateI = lapso.toDateI(); // console.log(dateI);
	var dateF = lapso.toDateF(); //console.log(dateF);
	do {
		var d = dateI.getDate();
		var m = dateI.getMonth()+1;
		var a = dateI.getFullYear();
		var dia = new rDia(d,d,m,a);
		dias.push(dia);
		dateI.setDate(dateI.getDate() + 1);
	} while (dateI.getTime() < dateF.getTime());

	return dias;
}
//------------------------------------------------------------------- Operaciones con Lapsos
//------------------------------------------------------------------- Intersección de Lapsos
// Devuelve un Lapso, con el UTA mayor, y TAU con la diferencia entre 
// final del anterior y uta del posterior
// |-----------------------------========= L1
// |---------------------------------========= L2
// |---------------------------------===== Intersección

function intersLapsos(l1,l2){
	var uta,tau;


	if (!l1 || !l2) return null; // falta l1, l2 o ambos

	var f1 = l1.uta + l1.tau; // granos
	var f2 = l2.uta + l2.tau; // granos

	if (l1.tau < 0 || l2.tau < 0) return null; // un lapso nulo (o ambos)
	else if (f1 < l2.uta || f2 < l1.uta) return null; // no intersectan
	else if (l1.uta == l2.uta &&  l1.tau == l2.tau) return l1; // son el mismo lapso
	else if (l1.uta < l2.uta && f1 >= f2) return l2; // l1 contiene a l2
	else if (l1.uta > l2.uta && f1 <= f2) return l1; // l2 contiene a l1
	else if (l1.uta <= l2.uta && f1 >= f2){
		console.log('l1.uta < l2.uta')
		uta = l2.uta;
		tau = f1-l1.uta;
	}
	else if (l1.uta >= l2.uta && f1 <= f2){
		console.log('l1.uta >= l2.uta')
		uta = l1.uta;
		tau = f2-l2.uta;
	}
	else {
		alert ('Caso no contemplado en Intersecc Lapsos');
		return null;
	} 

	return new rLapso(uta,tau);
}

//------------------------------------------------------------------- Unión de Lapsos
// Devuelve un Lapso, con el UTA menor, y TAU con la diferencia entre final mayor y UTA menor
// |-----------------------------========= L1
// |---------------------------------========= L2
// |-----------------------------============= Unión

function unionLapsos(l1,l2){
	var uta,tau;

	if (!l1 && !l2) return null; // faltan l1 y l2 
	else if (l1 && !l2) return l1; // falta l2 
	else if (!l1 && l2) return l2; // falta l1 
	else {
		var f1 = l1.uta + l1.tau;
		var f2 = l2.uta + l2.tau;

		if (l1.uta < l2.uta)	uta = l1.uta;
		else uta = l2.uta;

		if (f1 < f2) tau = f2 - uta;
		else tau = f1 - uta;
	}

	return new rLapso(uta,tau);
}

//------------------------------------------------------------------- Resta de Lapsos
// Devuelve un array con 1 ó 2 Lapsos
// Son 2 si el minuendo (L1) contiene al sustraendo (L2)
// |---------------------------------========= L1
// |-----------------------------========= L2
// |--------------------------------------==== L1 - L2 (1 Lapso)

// |-----------------------------========= L1
// |---------------------------------========= L2
// |-----------------------------==== L1 - L2 (1 Lapso)

// |---------------------------------========= L1
// |-----------------------------================== L2
// |---------------------------------   L1 - L2 (tau = 0) (1 Lapso) ?????

// |-----------------------------================== L1
// |---------------------------------========= L2
// |-----------------------------====---------===== L1 - L2 (2 Lapsos)


function restaLapsos(l1,l2){
	var uta,tau;
	var lapsos = [];

	var f1 = l1.uta + l1.tau;
	var f2 = l2.uta + l2.tau;

	if (!l1) return null; // minuendo nulo
	else if (l1 && !l2) return l1; // sustraendo nulo
	else if (f1 < l2.uta) return l1; // no intersectan
	else if (f2 < l1.uta) return l1; // no intersectan
	else {
		if ((l1.uta > l2.uta) && (f2 < f1)){
			uta = f2;
			tau = f1 - f2;
			lapsos.push(new rLapso(uta,tau));
		}
		else if ((l1.uta < l2.uta) && (f2 > f1)){
			uta = l1.uta;
			tau = l2.uta - l1.uta;
			lapsos.push(new rLapso(uta,tau));
		}
		else if ((l1.uta > l2.uta) && (f2 > f1)){
			uta = l1.uta;
			tau = 0;
			lapsos.push(new rLapso(uta,tau));
		}
		else if ((l1.uta < l2.uta) && (f1 > f2)){
			var lapsos = [];

			var uta0 = l1.uta;
			var tau0 = f2 - f1;
			lapsos.push(new rLapso(uta0,tau0));

			var uta1 = f2;
			var tau1 = f1 - f2;
			lapsos.push(new rLapso(uta1,tau1));
		}
	}
	return lapsos;
}


export default {
	zeller,diaJar,
	pasqa,epacta,faseLunar,
	rLapso,
	rKronos,rKairos,
	getDiasByLapso,
	fechas2Lapso,unionLapsos
}