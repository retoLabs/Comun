import utils from '../k1/libK1_Utils.js'

function crearItem(item_t,itemx,fnGraba){
	if (!itemx) return;
	var keo = null;
	if (utils.vgk.user) keo = utils.vgk.user.keo;
	else keo = 'ES';
	utils.vgk.appModal.item = itemx;
	utils.vgk.appModal.conds = mkValid(itemx.iam,keo);
	utils.vgk.appModal.edit_t = item_t || itemx.iam.toUpperCase();
	utils.vgk.appModal.keo = keo;
	utils.vgk.appModal.fnGraba = fnGraba;
	utils.vgk.appModal.modo = 'modal-container';
	utils.vgk.appModal.show = true;
	utils.vgk.appModal.editON = false;
}

function editaItem(item_t,itemx,fnGraba,fnBorra){
	if (!itemx) return;
	var keo = null;
//	console.log(utils.o2s(itemx));
	if (utils.vgk.user) keo =  utils.vgk.user.keo || 'ES';
	else keo = 'ES';
	utils.vgk.appModal.item = itemx; //clonaClase(itemx);
	utils.vgk.appModal.conds = mkValid(itemx.iam,keo);
	utils.vgk.appModal.edit_t = item_t || itemx.iam.toUpperCase();
	utils.vgk.appModal.keo = keo;
	utils.vgk.appModal.fnGraba = fnGraba;
	utils.vgk.appModal.fnBorra = fnBorra;
	utils.vgk.appModal.modo = 'modal-container';
	utils.vgk.appModal.show = true;
	utils.vgk.appModal.editON = true;
}

function mkValid(iam,keo){
	console.log('mkValid: '+iam+':'+keo);
	try {
		var textos = utils.vgk.clasesML.getTextos(iam,keo);
		var conds = {retol:textos.retol,valid:{}};
		for (var key in textos.valid) {
			conds.valid[key]={ok:true,txt:textos.valid[key]};;
		}
	return conds;

} catch (e) {return {retol:'Sin titulo',valid:{'tag':{ok:true,txt:'Cosa bad?'}}};}

}

Vue.component('item',{
	inheritAttrs: false,
	props: ['clase'],
	template: `
	<li style =" margin-top:2px;border-left:1px solid gray">
		<div>
			<span	@click="toggle" class="btn btn-info btn-xs" v-if="isFolder && open"><i class="fa fa-minus"></i></span>
			<span	@click="toggle" class="btn btn-info btn-xs" v-else-if="isFolder && !open"><i class="fa fa-plus"></i></span>
			 <b>{{ model.tag }}	</b> {{ model.descrip }}
			<span class="btn btn-warning btn-xs pull-right"	@click="editItem"><i class="fa fa-pencil"></i></span>
		</div>
		<ul v-show="open" v-if="isFolder">
			<item
				class="item"
				v-for="(model, index) in model.hijos"
				:key="index"
				:model="model">
			</item>
			<li class="btn btn-default btn-xs " @click="addChild()">+</li>
		</ul>
	</li>`

})

Vue.component('modal', {
	inheritAttrs: false,
	props: ['clase'],
	template: `
		<transition name="modal">
		<div class="modal-mask">
		<div class="modal-wrapper">
		<div :class="clase">

		<div class="modal-header">
		<slot name="header"></slot>
		</div>

		<div class="modal-body">
		<slot name="body"></slot>
		</div>

		<div class="modal-footer">
		<slot name="footer">
			<button class="modal-default-button" @click="$emit('close')"><i class="fa fa-close"></i></button>
			<button class="modal-success-button" @click="$emit('graba')"><i class="fa fa-save"></i></button>
			<button class="modal-warning-button" @click="$emit('borra')"><i class="fa fa-trash"></i></button>
		</slot>
		</div>

		</div> <!-- modal-container -->
		</div> <!-- modal-wrapper -->
		</div> <!-- modal-mask -->
		</transition>`
})

Vue.component('modal_lov', {
	inheritAttrs: false,
	props: ['clase'],
	template: `
		<transition name="modal">
		<div class="modal-mask">
		<div class="modal-wrapper">
		<div :class="clase">

		<div class="modal-header">
		<slot name="header"></slot>
		</div>

		<div class="modal-body">
		<slot name="body"></slot>
		</div>

		<div class="modal-footer">
		<slot name="footer">
			<button class="modal-default-button" @click="$emit('close')"><i class="fa fa-close"></i></button>
			<button class="modal-warning-button" @click="$emit('borra')"><i class="fa fa-trash"></i></button>
		</slot>
		</div>

		</div> <!-- modal-container -->
		</div> <!-- modal-wrapper -->
		</div> <!-- modal-mask -->
		</transition>`
})

function initAppsGlobal(){
	console.log('initAppsGlobal');
	utils.vgk.appModal =	new Vue({
		el: '#appModal',
		data: { 
			keo     : null,	// cod idioma usuario
			rolUsr  : null,	// rol usuario
			keoML	  : null,	// cod idioma para obtener los textos de error
			conds   : null,	// condiciones para validar
			hdrs    : null,	// header modal
			item    : null,	// item a editar/crear
			items	  : [],		// items ???
			fechas  : [],		// para convertir strings d/m/a a lapso
			lista	  : [],		// lista para select
			lista1  : [],		// lista para select 1
			lista2  : [],		// lista para select 2
			idAct   : null,	// index de select
			idAct1  : null,	// index de select 1
			idAct2  : null,	// index de select 2
			show    : false,	// visualiza modal
			showLOV : false,	// visualiza modal_LOV
			modo    : null,	// modal normal/big, etc
			edit_t  : null,	// código para que vue visualice un form u otro
			editON  : false,	// true: Edit, false: Crear nuevo item
			fnGraba : null,	// función a ejecutar al grabar (previa validación)
			fnBorra : null,	// función a ejecutar al borrar
			fnCambia: null,	// función a ejecutar en select change
		},
		methods :{
			handleChange : function(obj){if (this.fnCambia) this.fnCambia(obj)},
			borraLOV : function(){
				alert('Borra '+this.idAct);
				if (this.fnBorra) this.fnBorra(this.idAct);
				else alert('No hay fnBorra');
			},
			borra : function(){if (this.fnBorra) this.fnBorra(this.item);},
			textML: function(){
				// restaura a TRUE de todos los OK
				for (var key in this.conds.valid) {
					console.log('key:',key);
					this.conds.valid[key].ok = true;
				}
				var conds = this.item.vale(this.conds);
				var ok = true;
				for (var key in conds.valid) {
					ok = ok && conds.valid[key].ok;
				}
				if (ok){
					if (this.fnGraba) {this.fnGraba(this.item);}
					else alert('No hay fnGraba !!!');
				}
				else this.conds = conds;

			},
			graba : function(){
				if (utils.vgk.user && utils.vgk.user.keo.length > 0) this.textML();
				else if (this.fnGraba) {this.fnGraba(this.item);}
				else alert('No hay fnGraba !!!');
			}
		}
	})
}

//=================================================================== KRONOS
function initAppsKronos(){
	if(utils.r$('divMes')){
		utils.vgk.appMes = new Vue({
			el: '#divMes',
			data : {
				tag : '',
				mes : 0,
				heads : ['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado','Domingo'],
				items : [],
				idAct : 0,
			},
		methods :{
			actualiza : function(dias){this.items = dias;},
			actualizaTag: function(tag){this.tag = tag;},
			avant : function(){
				if (this.mes < 11)  showKronos(++this.mes); //mod_calendario.js
				else avantJar(); //mod_calendario.js
				},
			atras : function(){
				if (this.mes)  showKronos(--this.mes); //mod_calendario.js
				else atrasJar(); //mod_calendario.js
				},
			avantTodo : function(){
				this.mes = 11;
				showKronos(this.mes); //mod_calendario.js
				},
			atrasTodo : function(){
				this.mes = 0;
				showKronos(this.mes); //mod_calendario.js
				},
			setDia : function(id0){
				setDia(id0); //mod_calendario.js
			}
		}
		})
	}	
}

export default {initAppsGlobal,initAppsKronos,crearItem,editaItem}