import { CartService } from "../Services/carts.service.js";
import { productService } from "../Services/products.service.js";
import { TicketService } from "../Services/tickets.service.js";
import nodemailer from 'nodemailer'
import mongoose from "mongoose";



import { cartsModelo } from "../dao/models/carts.model.js";
import { productosModelo } from "../dao/models/products.model.js";
import { errorCotejoKeys, errorIdMongoose } from "../Utils/Errors.js";
import { TIPOS_ERROR } from "../Utils/TypesErros.js";
import { CustomError } from "../Utils/CustomErros.js";
import { verifyToken } from "../utils.js";


export class CartController {
    constructor() { }

    static async createCarts(req, res) {


        let listaProductos = await CartService.getCart()




        let products = []


        try {
            let nuevoProduct = await CartService.creatCart({ products })

            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json({ payload: nuevoProduct });
        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({ error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message })
        }







    }


    static async getCarts(req, res) {


        let archivoOne = await CartService.getCart()


        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ archivoOne });




    }

    static async getCartFilter(req, res, next) {







        let id = req.params.cid





        const esObjectIdValido = (id) => mongoose.Types.ObjectId.isValid(id);

        try {
            if (!esObjectIdValido(id)) {

                try {
                    req.logger.error("El id ingresado no es de mongoose")
                    throw new CustomError("Ingresar Id Mongoose", "No es Id Mongoose", TIPOS_ERROR.ARGUMENTOS, errorIdMongoose(id))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }
            }
        } catch (error) {
            return next(error)
        }




        let archivoOne
        try {

            archivoOne = await CartService.getOneCartPopulate({ _id: id }, 'products.product')

        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({ error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message })
        }




        try {

            if (!archivoOne) {
                try {
                    throw new CustomError("Ingresar ID", "ID no existe en la BD", TIPOS_ERROR.ARGUMENTOS, errorIdNoEnBD(idP))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }

            }
        } catch (error) {
            return next(error)
        }






        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ archivoOne });

    }


    static async getPurchase(req, res) {

        let id = req.params.cid




        const esObjectIdValido = (id) => mongoose.Types.ObjectId.isValid(id);

        try {
            if (!esObjectIdValido(id)) {

                try {
                    req.logger.error("El id ingresado no es de mongoose")
                    throw new CustomError("Ingresar Id Mongoose", "No es Id Mongoose", TIPOS_ERROR.ARGUMENTOS, errorIdMongoose(id))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }
            }
        } catch (error) {
            return next(error)
        }







        let existProductsInCart = await CartService.getOneCart({ _id: id })
        existProductsInCart = existProductsInCart.products.length
        if (existProductsInCart == 0 || existProductsInCart == undefined || existProductsInCart == null) {
            const esSolicitudJSON = req.headers['content-type'] === 'application/json';
            if (esSolicitudJSON) {
                return res.status(400).json('NO EXISTE PRODUCTOS EN EL CARRITO');
            } else {
                return res.redirect('/products')
            }
        }




        let carritos = await CartService.getOneCart({ _id: id })

        let qProd = carritos.products

        let usuario = req.cookies
        usuario = verifyToken(usuario.coderCookie)


        let CartsConStock = []
        let CartsSinStock = []
        let precios = []
        let idsProducts = []


        for (let i = 0; i < carritos.products.length; i++) {

            let ProductoSolicitado = qProd[i].product
            let QprodSolicitado = qProd[i].quantity

            let stockDisponible = await productService.getOneProduct({ _id: ProductoSolicitado })
            stockDisponible = stockDisponible.stock


            if (QprodSolicitado < stockDisponible) {


                let prodConStock = await productService.getOneProduct({ _id: ProductoSolicitado })
                CartsConStock.push(prodConStock)


                let stockDescontar = QprodSolicitado * -1

                const updatedProduct = await productService.findUpdate(
                    { _id: ProductoSolicitado, stock: { $gt: 0 } },
                    { $inc: { stock: stockDescontar } },
                    { new: true }
                )


                let precio = await prodConStock.price

                precios.push(precio)

            } else {
                let prodSinStock = await productService.getOneProduct({ _id: ProductoSolicitado })
                CartsSinStock.push(prodSinStock)

            }



        }

        if (CartsConStock.length == 0 && CartsSinStock.length > 0) {
            const esSolicitudJSON = req.headers['content-type'] === 'application/json';
            if (esSolicitudJSON) {
                return res.status(400).json('TODAVIA NO HAY STOCK DE LOS PRODUCTOS. PORFAVOR CONTACTESE CON NOSOTROS PARA MAYOR INFORMACION');
            }
            let sinStock = true
            return res.status(201).render('purchase', { titulo: 'Ticket', sinStock })


        }



        let CartstoDelete = CartsConStock


        for (let i = 0; i < CartstoDelete.length; i++) {

            let idDelete = CartstoDelete[i]._id

            await CartService.findUpdate(
                {
                    _id: id
                }, {
                $pull: { products: { product: idDelete } }
            }

            )









        }

        function generarCodigo(longitud) {
            let codigo = '';
            const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

            for (let i = 0; i < longitud; i++) {
                const indice = Math.floor(Math.random() * caracteres.length);
                codigo += caracteres.charAt(indice);
            }

            return codigo;
        }
        const codigoAleatorio = generarCodigo(6);

        let existCode = await TicketService.getOneticket({ codigoAleatorio })

        if (existCode) {
            return codigoAleatorio = generarCodigo(6)
        }



        let code = codigoAleatorio



        let amount = precios.reduce((total, precio) => total + precio, 0);

        let compraTicket = {
            code,
            amount,
            purchaser: usuario.email,
            products: CartsConStock

        }





        try {

            let nuevoticket = await TicketService.creatticket(compraTicket)

        } catch (e) {
            req.logger.error("error" + e.menssage)
        }





        let ticket = await TicketService.getOneticket({ code: code })




        const transport = nodemailer.createTransport(
            {
                service: 'gmail',
                port: 587,
                auth: {
                    user: "munozmartin.dev@gmail.com",
                    pass: "oqcd isbp dftr cflt"
                }
            }
        )

        const enviar = () => {
            return transport.sendMail(
                {
                    from: "Martin G. Muñoz munozmartin.dev@gmail.com",
                    to: "munozmartin.dev@gmail.com",
                    subject: "Felicitaciones por la compra realizada",
                    html: ` 
        <h3 style="color:blue;">Felicitaciones por la compra realizada</h3>
        <h1 style="color:red;">Compraste muchas cosas</h1>
        Prueba...
        <p>Prueba... texto...!!!</p>
        `
                }
            )
        }

        enviar()




        const esSolicitudJSON = req.headers['content-type'] === 'application/json';

        if (esSolicitudJSON) {
            res.status(200).json({ CartsConStock, carritos });
        } else {

            res.status(201).render('purchase', { titulo: 'Ticket', CartsConStock, carritos, usuario, ticket })
        }






    }

    static async addProduct(req, res, next) {



        let cid = req.params.cid



        const esObjectIdValido = (id) => mongoose.Types.ObjectId.isValid(id);

        try {
            if (!esObjectIdValido(cid)) {

                try {
                    req.logger.error("El id ingresado no es de mongoose")
                    throw new CustomError("Ingresar Id Mongoose", "No es Id Mongoose", TIPOS_ERROR.ARGUMENTOS, errorIdMongoose(cid))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }
            }
        } catch (error) {
            return next(error)
        }







        let archivo
        try {
            archivo = await CartService.getOneCart({ _id: cid })


        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({ error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message })
        }



        try {

            if (!archivo) {
                try {
                    req.logger.warning('El id ingresado no esta en la base de datos')
                    throw new CustomError("Ingresar ID", "ID no existe en la BD", TIPOS_ERROR.ARGUMENTOS, errorIdNoEnBD(cid))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }

            }
        } catch (error) {
            return next(error)
        }









        let pid = req.params.pid

        const esObjectIdValidoProduct = (id) => mongoose.Types.ObjectId.isValid(id);

        try {
            if (!esObjectIdValidoProduct(pid)) {

                try {
                    req.logger.error("El id ingresado no es de mongoose")
                    throw new CustomError("Ingresar Id Mongoose", "No es Id Mongoose", TIPOS_ERROR.ARGUMENTOS, errorIdMongoose(pid))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }
            }
        } catch (error) {
            return next(error)
        }












        let archivoPM
        try {

            archivoPM = await productService.getOneProduct({ status: true, _id: pid })

        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({ error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message })
        }



        try {

            if (!archivoPM) {
                try {
                    req.logger.warning('El id ingresado no esta en la base de datos')
                    throw new CustomError("Ingresar ID", "ID no existe en la BD", TIPOS_ERROR.ARGUMENTOS, errorIdNoEnBD(pid))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }

            }
        } catch (error) {
            return next(error)
        }




        let userCookieToken = req.cookies.coderCookie
        userCookieToken = verifyToken(userCookieToken)
        let ownerRol = userCookieToken.rol.toUpperCase()
        let ownerEmail = userCookieToken.email.toUpperCase()


        let ownerArchivoPM

        if (archivoPM.owner) {

            ownerArchivoPM = archivoPM.owner.toUpperCase()

            if (ownerRol === "PREMIUM" && ownerArchivoPM == ownerEmail) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: `No puede agregar productos siendo el owner del producto igual al suyo` })

            }
        }



        let productAdded


        if (archivoPM) {

            archivo = await CartService.getOneCart({ _id: cid })
            archivo = archivo.products


            let prodFind = await CartService.getOneCart({ _id: cid })

            prodFind = prodFind.products.find(product => product.product.toString() === pid)

            let findQuantity
            if (prodFind == undefined) {
                let product = pid
                let quantity = 1
                let CreateProduct = await CartService.updateOneCart({ _id: cid }, { $push: { products: { product, quantity } } })



            } else {

                findQuantity = await CartService.getOneCart({ _id: cid })
                findQuantity = findQuantity.products
                findQuantity = findQuantity.find(product => product.product.toString() === pid)
                findQuantity = findQuantity.quantity
                findQuantity = findQuantity + 1




                productAdded = await CartService.updateOneCart(
                    {
                        _id: cid
                    },
                    {
                        "$set": {
                            "products.$[elemX].quantity": findQuantity
                        }
                    },
                    {
                        "arrayFilters": [{ "elemX.product": pid }]
                    })




            }


            let CarritoActualizado

            if (prodFind == null) {
                CarritoActualizado = `Se Creo los campos product y quantity. Product = ${pid} y Quantity = 1`
            } else {
                CarritoActualizado = await CartService.getOneCart({ _id: cid })
            }



            res.setHeader('Content-Type', 'application/json');
            return res.status(201).json({ CarritoActualizado, productAdded });


        }



    }


    static async updateCart(req, res, next) {



        let idParam = req.params.cid




        const esObjectIdValido = (id) => mongoose.Types.ObjectId.isValid(id);

        try {
            if (!esObjectIdValido(idParam)) {

                try {
                    req.logger.error("El id ingresado no es de mongoose")
                    throw new CustomError("Ingresar Id Mongoose", "No es Id Mongoose", TIPOS_ERROR.ARGUMENTOS, errorIdMongoose(idParam))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }
            }
        } catch (error) {
            return next(error)
        }





        let archivoOne
        try {

            archivoOne = await CartService.getPaginate({ _id: idParam })


        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({ error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message })
        }


        try {

            if (!archivoOne) {
                try {
                    req.logger.warning('El id ingresado no esta en la base de datos')
                    throw new CustomError("Ingresar ID", "ID no existe en la BD", TIPOS_ERROR.ARGUMENTOS, errorIdNoEnBD(idParam))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }

            }
        } catch (error) {
            return next(error)
        }











        let llavesEjemplos = {
            _id: "ejemplo",
            id: 1,
            products: [
                {
                    product: "ejemplo",
                    quantity: 123
                }
            ]
        }
        let llavesBody = Object.keys(req.body)
        llavesEjemplos = Object.keys(llavesEjemplos)


        const cotejoArrays = llavesBody.every((llaves) => llavesEjemplos.includes(llaves))



        try {

            if (!cotejoArrays) {
                try {
                    throw new CustomError("Ingresar propiedades", "Alguna/as de las propiedas no son permitidas", TIPOS_ERROR.ARGUMENTOS, errorCotejoKeys(llavesBody, llavesEjemplos))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }

            }
        } catch (error) {
            return next(error)
        }













        let objetoBody = req.body

        let ProductoEliminado = await CartService.findUpdate(
            { _id: idParam },
            { $set: { id: objetoBody.id, _id: objetoBody._id, products: objetoBody.products } }

        )

        let updateCart = await CartService.getOneCart({ _id: idParam })

        const esSolicitudJSON = req.headers['content-type'] === 'application/json';

        if (esSolicitudJSON) {


            res.status(200).json({
                ProductoEliminado, updateCart
            })
        }
    }



    static async updateCartProduct(req, res, next) {



        let idParam = req.params.cid


        const esObjectIdValido = (id) => mongoose.Types.ObjectId.isValid(id);

        try {
            if (!esObjectIdValido(idParam)) {

                try {
                    req.logger.error("El id ingresado no es de mongoose")
                    throw new CustomError("Ingresar Id Mongoose", "No es Id Mongoose", TIPOS_ERROR.ARGUMENTOS, errorIdMongoose(idParam))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }
            }
        } catch (error) {
            return next(error)
        }







        let archivoOne
        try {

            archivoOne = await CartService.getPaginate({ _id: idParam })
        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({ error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message })
        }


        try {

            if (!archivoOne) {
                try {
                    req.logger.warning('El id ingresado no esta en la base de datos')
                    throw new CustomError("Ingresar ID", "ID no existe en la BD", TIPOS_ERROR.ARGUMENTOS, errorIdNoEnBD(idParam))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }

            }
        } catch (error) {
            return next(error)
        }



        let pid = req.params.pid



        const esObjectIdValidoProduct = (id) => mongoose.Types.ObjectId.isValid(id);

        try {
            if (!esObjectIdValidoProduct(pid)) {

                try {
                    req.logger.error("El id ingresado no es de mongoose")
                    throw new CustomError("Ingresar Id Mongoose", "No es Id Mongoose", TIPOS_ERROR.ARGUMENTOS, errorIdMongoose(pid))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }
            }
        } catch (error) {
            return next(error)
        }







        let archivoPM
        try {

            archivoPM = await productService.getOneProduct({ status: true, _id: pid })
        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({ error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message })
        }





        try {

            if (!archivoPM) {
                try {
                    req.logger.warning('El id ingresado no esta en la base de datos')
                    throw new CustomError("Ingresar ID", "ID no existe en la BD", TIPOS_ERROR.ARGUMENTOS, errorIdNoEnBD(pid))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }

            }
        } catch (error) {
            return next(error)
        }














        let llavesEjemplos = { quantity: 123 }
        let llavesBody = Object.keys(req.body)
        llavesEjemplos = Object.keys(llavesEjemplos)


        const cotejoArrays = llavesBody.every((llaves) => llavesEjemplos.includes(llaves))


        try {

            if (!cotejoArrays) {
                try {
                    throw new CustomError("Ingresar propiedades", "Alguna/as de las propiedas no son permitidas", TIPOS_ERROR.ARGUMENTOS, errorCotejoKeys(llavesBody, llavesEjemplos))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }

            }
        } catch (error) {
            return next(error)
        }





        let bodyQuantity = req.body
        bodyQuantity = Object.values(bodyQuantity)
        bodyQuantity = bodyQuantity[0]


        let ProductoOriginal = await CartService.getPaginate({ _id: idParam })


        try {

            await CartService.findUpdate(
                {
                    _id: idParam
                },
                {
                    "$set": {
                        "products.$[elemX].quantity": bodyQuantity
                    }
                },
                {
                    "arrayFilters": [{ "elemX.product": pid }]
                })


        } catch (err) {
            req.logger.error("Error " + err.menssage)
        }



        let updateCart = await CartService.getOneCart({ _id: idParam })
        const esSolicitudJSON = req.headers['content-type'] === 'application/json';

        if (esSolicitudJSON) {


            res.status(200).json({
                ProductoOriginal: ProductoOriginal.docs, updateCart
            })
        }






    }


    static async deleteProduct(req, res) {



        let id = req.params.cid

        const esObjectIdValido = (id) => mongoose.Types.ObjectId.isValid(id);

        try {
            if (!esObjectIdValido(id)) {

                try {
                    req.logger.error("El id ingresado no es de mongoose")
                    throw new CustomError("Ingresar Id Mongoose", "No es Id Mongoose", TIPOS_ERROR.ARGUMENTOS, errorIdMongoose(id))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }
            }
        } catch (error) {
            return next(error)
        }




        let archivo
        try {
            archivo = await CartService.getOneCart({ _id: id })

        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({ error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message })
        }




        try {

            if (!archivo) {
                try {
                    req.logger.warning('El id ingresado no esta en la base de datos')
                    throw new CustomError("Ingresar ID", "ID no existe en la BD", TIPOS_ERROR.ARGUMENTOS, errorIdNoEnBD(id))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }

            }
        } catch (error) {
            return next(error)
        }





        let pid = req.params.pid



        let archivoPM
        try {

            archivoPM = await productService.getOneProduct({ status: true, _id: pid })

        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({ error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message })
        }




        try {

            if (!archivoPM) {
                try {
                    req.logger.warning('El id ingresado no esta en la base de datos')
                    throw new CustomError("Ingresar ID", "ID no existe en la BD", TIPOS_ERROR.ARGUMENTOS, errorIdNoEnBD(pid))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }

            }
        } catch (error) {
            return next(error)
        }





        if (archivoPM) {


            archivo = await CartService.getOneCart({ _id: id })
            archivo = archivo.products

            let prodFind = await CartService.getOneCart({ _id: id })



            let ProductoEliminado

            if (prodFind == undefined) {
                res.setHeader('Content-Type', 'application/json');
                return res.status(400).json({ error: `El id ${pid} no existe` })
            } else {


                ProductoEliminado = await CartService.findUpdate(
                    { _id: id },
                    { $pull: { products: { product: pid } } }

                );
            }

            let productsDelete = await CartService.getOneCart({ _id: id })


            res.setHeader('Content-Type', 'application/json');
            return res.status(201).json({ ProductoEliminado, productsDelete });

        }
    }


    static async deleteCart(req, res) {



        let id = req.params.cid

        const esObjectIdValido = (id) => mongoose.Types.ObjectId.isValid(id);

        try {
            if (!esObjectIdValido(id)) {

                try {
                    req.logger.error("El id ingresado no es de mongoose")
                    throw new CustomError("Ingresar Id Mongoose", "No es Id Mongoose", TIPOS_ERROR.ARGUMENTOS, errorIdMongoose(id))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }
            }
        } catch (error) {
            return next(error)
        }


        let archivo
        try {
            archivo = await CartService.getOneCart({ _id: id })

        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({ error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message })
        }




        try {

            if (!archivo) {
                try {
                    req.logger.warning('El id ingresado no esta en la base de datos')
                    throw new CustomError("Ingresar ID", "ID no existe en la BD", TIPOS_ERROR.ARGUMENTOS, errorIdNoEnBD(id))
                } catch (error) {
                    throw new CustomError(error.name ? error.name : "error generico", error.message, error.codigo ? error.codigo : TIPOS_ERROR.INDETERMINADO, error.descrip ? error.descrip : `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`)
                }

            }
        } catch (error) {
            return next(error)
        }




        let ProductoEliminado = await CartService.findUpdate(
            { _id: id },
            { $set: { products: [] } },
        );


        let UpdateProduct = await CartService.getOneCart({ _id: id })

        res.setHeader('Content-Type', 'application/json');
        return res.status(201).json({ UpdateProduct, ProductoEliminado });

    }


}