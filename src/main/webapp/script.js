var listaProductos = []; //array que almacena productos
var ids = 1;
class producto {
	constructor(nombre, coste) {
		this.nombre = nombre;
		this.coste = coste;
	}
}

var carro = [] //array del carrito provisional del pedido
class productoCarro {
	constructor(item, cantidad) {
		this.item = item;
		this.cantidad = cantidad;
	}

	cambiarCantidad(cantidad) {
		this.cantidad = cantidad;
	}
	obtenerTotal() {
		return this.item.coste * this.cantidad;
	}
}

var listaPedidos = []; //array de los pedidos creados
class pedido {
	constructor(carrito, direc, fecha, coste, id) {
		this.id=id;
		this.carrito = carrito;
		this.direc = direc;
		this.fecha = fecha;
		this.coste = coste;
		this.estadoIVA = false;
	}
	escribirFecha(){
		return this.fecha.getDate()+"/"+(this.fecha.getMonth()+1)+"/"+this.fecha.getFullYear();
	}
	cambiarIVA() {
		if (!this.estadoIVA) {
			this.coste = this.coste * 1.21;
			this.estadoIVA = true;
		}
		else {
			this.coste = this.coste / 1.21;
			this.estadoIVA = false;
		}
	}
	listarProductos(){
		let texto="";
		this.carrito.forEach(function(prod){
			texto+=prod.item.nombre + " , " + prod.cantidad + " uds";
		});
		return texto;
	}
	calcularDiaEntrega(){
		let final = new Date (this.fecha);
		let domingo = final.getDay()==0;
		let sabado = final.getDay()==6 ;
		if(this.coste>50){
			 if(domingo){
				final.setDate(final.getDate()+1);
			 }
			 if(sabado){
				final.setDate(final.getDate()+2);
			 }
			 final.setDate(final.getDate()+5); //premium
		}
		else{
			if(domingo){
				final.setDate(final.getDate()+2);
			}
			if(sabado){
				final.setDate(final.getDate()+4);
			}
			final.setDate(final.getDate()+10); //normal
		}
		return final;
	}
	calcularDiasHastaEntrega(){
		let hoy = new Date();
		let dias = this.calcularDiaEntrega()-hoy;
		return dias/(1000*60*60*24);//al ser milisegundos son 1000ms-60s-60min-24horas
	}
}
//configuración inicial
inicio();
//eventos
let btn1 = document.getElementById("btn1");
btn1.addEventListener("click", anyadirCarrito);

let btn2 = document.getElementById("btn2");
btn2.addEventListener("click", anyadirPedido);

let btn3 = document.getElementById("btn3");
btn3.addEventListener("click", vaciarCarrito);

let btn4 = document.getElementById("btn4");
btn4.addEventListener("click", function(e){
	filtrar(e.target.dataset.filtro);
});
let btn5 = document.getElementById("btn5");
btn5.addEventListener("click", function(e){
	filtrar(e.target.dataset.filtro);
});
let btn6 = document.getElementById("btn6");
btn6.addEventListener("click",  function(e){
	filtrar(e.target.dataset.filtro);
});


//funciones

function anyadirPedido(){
	let fecha = new Date(document.getElementById("fecha").value);
	let direc = document.getElementById("direc").value;
	let hoy = new Date();
	if(fecha>hoy){
		return;
	}
	if(direc.trim()===""){ //el trim esta para quitar los espacios, no se exige en la prueba
		return;
	}
	let coste = 0;
	carro.forEach(prod=>coste+=prod.obtenerTotal());
	if(coste==0){
		return;
	}
	const aux = carro.concat(); //se recomienda en estos casos guardar una copia del array.
	const elPedido= new pedido(aux,direc,fecha,coste, ids);
	ids++;
	listaPedidos.push(elPedido);

	vaciarCarrito();
	escribirPedidos(listaPedidos);
	guardarCambios();
	escribirCambios(1);
}

function filtrar(valor){
	let listaFiltrada;
	switch (valor){
		case "1": //premium
			listaFiltrada=listaPedidos.filter(ped=>ped.coste>50);
			escribirCambios(3);
			break;
		case "2": //urgentes
			listaFiltrada=listaPedidos.filter(ped=>ped.calcularDiasHastaEntrega()<7 && ped.calcularDiasHastaEntrega()>0);
			escribirCambios(3);
			break;
		default: //sin filtro
			listaFiltrada=listaPedidos;
	}

	escribirPedidos(listaFiltrada);
}


function escribirPedidos(lista){
	const rutaTabla= document.querySelector("tbody");
	rutaTabla.innerHTML="";
	lista.forEach(function(ped){
		let fila = document.createElement("tr");
		let celda1 = document.createElement("td");
		celda1.innerText=ped.escribirFecha();
		let celda2= document.createElement("td");
		celda2.innerText=ped.listarProductos();
		
		let celda3 = document.createElement("td");
		celda3.innerText=Math.trunc(ped.coste*100)/100; //manera cutre de quedarse con 2 decimales
		
		let celda4=document.createElement("td");
		celda4.innerText=ped.direc;
		let celda5=document.createElement("td");
		let btnEliminar = document.createElement("button");
		btnEliminar.dataset.id=ped.id;
		btnEliminar.innerText="X";
		btnEliminar.addEventListener("click",function(e){
			let id = e.target.dataset.id; 
			let index = listaPedidos.findIndex(p=>p.id==id);
			//confirmación
			let texto="Se va a eliminar el pedido con fecha :"+listaPedidos[index].escribirFecha() +"\nIntroduzca la fecha para confirmar";
			let valor = prompt(texto);
			if(valor == listaPedidos[index].escribirFecha()){
				//eliminamos
				listaPedidos.splice(index,1);
				let indexVista = lista.findIndex(p=>p.id==id);
				lista.splice(indexVista,1);
				escribirPedidos(lista);
				guardarCambios();
				escribirCambios(2);
			}
			else{
				alert("Se ha cancelado la operación");
			}
			
		})
		let btnIVA = document.createElement("button");
		btnIVA.dataset.id=ped.id;
		btnIVA.innerText="IVA";
		btnIVA.addEventListener("click",function(e){
			let id = Number(e.target.dataset.id);
			let index = listaPedidos.findIndex(p=>p.id==id);
			listaPedidos[index].cambiarIVA();
			escribirPedidos(lista); 
		});
		celda5.appendChild(btnEliminar);
		celda5.appendChild(btnIVA);
		fila.appendChild(celda1);
		fila.appendChild(celda2);
		fila.appendChild(celda3);
		fila.appendChild(celda4);
		fila.appendChild(celda5);
		rutaTabla.appendChild(fila);
	});
	
	calcularTotal(lista);
}

function calcularTotal(lista){
	let total = 0;
	lista.forEach(ped=>total+=ped.coste);
	total=Math.trunc(total*100)/100;
	document.getElementById("total").innerHTML= "<h3>Total: "+total + "€</h3>";
	
}


function vaciarCarrito(){
	carro=[]; //pueden también quitar todo sacando los elementos
	escribirCarrito();
}

function anyadirCarrito() {
	let id = document.querySelector("select").value;
	if (id < 0) {
		return;
	}
	let cantidad = document.getElementById("uds").value;
	if (cantidad <= 0) {
		return;
	}
	//comprobar si ya esta dentro.
	let index = carro.findIndex(function(prod) {
		return prod.item.nombre === listaProductos[id].nombre;
	});
	if (index == -1) {
		//si no existe ya
		let nuevoProducto = new productoCarro(listaProductos[id], cantidad);
		carro.push(nuevoProducto);
	}
	else {
		carro[index].cambiarCantidad(cantidad);

	}
	escribirCarrito();
}
function escribirCarrito() {
	let elemento = document.querySelector("ul");
	elemento.innerHTML = "";
	for (let item of carro) {
		let lista = document.createElement("li");
		lista.innerText = item.item.nombre + " , " + item.cantidad + " uds";
		elemento.appendChild(lista);
	}
}

function inicio() {
	let p1 = new producto("Patatas", 4.5);
	let p2 = new producto("Tomates", 3.67);
	let p3 = new producto("Habas", 1.25);
	listaProductos.push(p1);
	listaProductos.push(p2);
	listaProductos.push(p3);
	escribirSelect();
	cargarPedidos();
}

function escribirSelect() {
	let elemento = document.querySelector("select");
	let id = 0;
	for (let item of listaProductos) {
		let opcion = document.createElement("option");
		opcion.setAttribute("value", id);
		opcion.innerText = item.nombre;
		elemento.appendChild(opcion);
		id++;
	}
}


//extra: guardar y cargar valores.

function guardarCambios(){
	const texto = JSON.stringify(listaPedidos);
	localStorage.setItem("pedidos",texto);
}


function cargarPedidos(){
	const texto = localStorage.getItem("pedidos");
	//paramos si no tenemos nada
	if(texto==null){
		return;
	}
	let pasoIntermedio = JSON.parse(texto);
	
	pasoIntermedio.forEach(function(valor){
		
		
		let carrito =[];
		valor.carrito.forEach(function(prod){
			let item=listaProductos.find(p=>p.nombre==prod.item.nombre);
			let prodCarro = new productoCarro(item,prod.cantidad);
			carrito.push(prodCarro);
		});
		const fecha = new Date(valor.fecha);
		let coste = 0;
		carrito.forEach(p=>coste+=p.obtenerTotal());
		const ped = new pedido(carrito, valor.direc, fecha, coste, valor.id);
		listaPedidos.push(ped);
		// Mantenemos el contador de IDs actualizado al número más alto
		if (valor.id >= ids) {
			ids = valor.id + 1;
		 }
		 escribirCambios(1);
	});
	escribirPedidos(listaPedidos);
}


function escribirCambios(opcion){
	const cambios = document.getElementById("cambios");
	let punto = document.createElement("li");
	const ahora = new Date();
	switch(opcion){ //se podrían añadir algunos más, como no están marcados en el enunciado pondremos estos de ejemplo
		case 1:
			punto.innerText="Agregado pedido" + "("+ahora.getHours()+":"+ahora.getMinutes()+")";
			break;
		case 2:
			punto.innerText="Eliminado pedido"+ "("+ahora.getHours()+":"+ahora.getMinutes()+")";
			break;
		case 3:
			punto.innerText="Filtro activado"+ "("+ahora.getHours()+":"+ahora.getMinutes()+")";
			break;
	}
	cambios.appendChild(punto);
}
