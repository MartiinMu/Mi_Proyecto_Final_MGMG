console.log("Cliente conectado")


const socket=io()

socket.on("newProduct",Prod=>{
    console.log("Producto agregado:",Prod)
    
  
   let nuevoProductoTexto = 
   
   `<strong>Id:</strong> ${Prod._id} <br>
   <strong>Title:</strong> ${Prod.title} <br>
   <strong>Description:</strong> ${Prod.description}<br>
   <strong>Code:</strong> ${Prod.code}<br>
   <strong>Price: </strong> ${Prod.price}<br>
   <strong>Status: </strong>${Prod.status}<br>
   <strong>Stock: </strong> ${Prod.stock}<br>
   <strong>Category: </strong>${Prod.category}<br>
   <strong>Thumbnails: </strong> ${Prod.thumbnails}<br>`
   

    let ulProd=document.querySelector('ul')
    let liNuevoProducto=document.createElement('li')
    liNuevoProducto.innerHTML=nuevoProductoTexto
    ulProd.append(liNuevoProducto)
})


socket.on("removeProduct",Prod=>{
    let id=parseInt(Prod)
    let removProd = document.querySelectorAll('li')[id]
    removProd.remove();

})


const comprar = async(idProducto, idCarrito)=>{

    console.log("El id del carrito es  " + idCarrito + "El id del producto es  :::  " + idProducto)
   
     let respuesta=await fetch("/api/carts/"+idCarrito+"/product/"+idProducto,
    {method:"post"})
    let datos=await respuesta.json()
    console.log(datos)



}






