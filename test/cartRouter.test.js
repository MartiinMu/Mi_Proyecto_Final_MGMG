import mongoose from "mongoose";
import { expect } from "chai";


import supertest from "supertest";
import { describe, it } from "mocha";




import { config } from "../src/config/config.js";
import { verifyToken } from "../src/utils.js";
import { productService } from "../src/Services/products.service.js";



try {
    // await mongoose.connect(config.MONGO_URL,{dbName: config.DBNAME})
    await mongoose.connect('mongodb+srv://martingustavom:Coderhouse2023@cluster0.czbpnhg.mongodb.net/?retryWrites=true&w=majority', { dbName: 'ecommerces' })

    console.log('DB Online 2...!!!')
} catch (error) {
    console.log(error.message)
}

const requester = supertest("http://localhost:8080")
let cookie
let cookie2
let cookieADM
let idDelete
let cidAddProd
let pidAddProd

describe("Prueba del proyecto ecommerce", async function () {
    this.timeout(20000)

    describe("Prueba del modulo Carts", async function () {


        after(async () => {
            let resultado = await mongoose.connection.collection("usuarios").deleteMany({ email: "testing@gmail.com" })
        
        })



        it("Endpoint /api/carts, metodo POST, Crea un carrito", async () => {

            let usuarioCartsPost = { first_name: "nombreTest", last_name: "apellidoTest", age: 41, email: "testing@gmail.com", password: "123" }


            let resPostCarts = await requester.post("/api/sessions/registro").send(usuarioCartsPost)



            let usuarioCarts = { email: "testing@gmail.com", password: "123" }

            let resultado2 = await requester.post("/api/sessions/login")
                .send(usuarioCarts)


            cookie = resultado2.headers["set-cookie"][0]


        })



        it("Endpoint /api/carts, metodo GET, obtiene carritos", async () => {


            let usuarioGetCarts = { email: "adminCoder@coder.com", password: "adminCod3r123" }

            let resultado = await requester.post("/api/sessions/login")
                .send(usuarioGetCarts)


            cookieADM = resultado.headers["set-cookie"][0]


            let resGetCarts = await requester.get("/api/carts")
                .set("Cookie", cookieADM)




            expect(resGetCarts.statusCode).to.be.equal(200)
            expect(resGetCarts.ok).to.be.true
            expect(resGetCarts._body.archivoOne).to.exist




        })


        it("Endpoint /api/carts/:cid, metodo GET, obtiene el carrito solicitado", async () => {

            let cid = "6574b227db79d0e05ccd2c5e"

            let resGetCartsCid = await requester.get("/api/carts/" + cid)
                .set("Cookie", cookie)



            expect(resGetCartsCid.statusCode).to.be.equal(200)
            expect(resGetCartsCid.ok).to.be.true
            expect(resGetCartsCid._body.archivoOne).to.exist
        })





        it("Endpoint /api/carts/:cid/product/:pid, metodo POST, Crea un producto", async () => {



            pidAddProd = "657390b51218cd6c0853f699"


            cidAddProd = cookie.split("=")[1]
            cidAddProd = cidAddProd.split(";")[0]

            cidAddProd = verifyToken(cidAddProd)
            cidAddProd = cidAddProd.cart


            let resAddQuantityandProd = await requester.post("/api/carts/" + cidAddProd + "/product/" + pidAddProd)
                .set("Cookie", cookie)


            expect(resAddQuantityandProd.statusCode).to.be.equal(201)
            expect(resAddQuantityandProd.ok).to.be.true
            expect(resAddQuantityandProd._body.CarritoActualizado).to.exist



            let usuarioCarts = { email: "testing@gmail.com", password: "123" }

            let resultado2 = await requester.post("/api/sessions/login")
                .send(usuarioCarts)


            cookie2 = resultado2.headers["set-cookie"][0]


            cidAddProd = cookie2.split("=")[1]
            cidAddProd = cidAddProd.split(";")[0]

            cidAddProd = verifyToken(cidAddProd)
            cidAddProd = cidAddProd.cart


            let resAddQuantityandProd2 = await requester.post("/api/carts/" + cidAddProd + "/product/" + pidAddProd)
                .set("Cookie", cookie2)



            expect(resAddQuantityandProd2.statusCode).to.be.equal(201)
            expect(resAddQuantityandProd2.ok).to.be.true
            expect(resAddQuantityandProd2._body.productAdded.modifiedCount).to.exist.and.to.be.equal(1)


        })



        it("Endpoint /api/carts/:cid, metodo PUT, actualiza el carrito solicitado", async () => {


            let cartPut = {
                _id: cidAddProd,
                products: [
                    {
                        product: pidAddProd,
                        quantity: 5
                    }
                ]
            }

            let resPutCartPid = await requester.put("/api/carts/" + cidAddProd)
                .set("Cookie", cookie2)
                .send(cartPut)

            expect(resPutCartPid.statusCode).to.be.equal(200)
            expect(resPutCartPid.ok).to.be.true
            expect(resPutCartPid._body.updateCart.products[0].quantity).to.exist.and.to.be.equal(5)

        })








        it("Endpoint /api/carts/:cid/product/:pid, metodo PUT, modifica quantity de products", async () => {




            let quantity = { quantity: 6 }


            let resUpdateQuantity = await requester.put("/api/carts/" + cidAddProd + "/product/" + pidAddProd)
                .set("Cookie", cookie)
                .send(quantity)

            expect(resUpdateQuantity.statusCode).to.be.equal(200)
            expect(resUpdateQuantity.ok).to.be.true
            expect(resUpdateQuantity._body.updateCart.products[0].quantity).to.exist.and.to.be.equal(6)




        })























        it("Endpoint /api/carts/:cid/pruchase, metodo GET, devuelve un ticket", async () => {


            let resGetPurchase = await requester.get("/api/carts/" + cidAddProd + "/purchase")
                .set("Cookie", cookie)


            expect(resGetPurchase.statusCode).to.be.equal(201)
            expect(resGetPurchase.ok).to.be.true





            let usuarioCarts = { email: "testing@gmail.com", password: "123" }

            let resultado2 = await requester.post("/api/sessions/login")
                .send(usuarioCarts)


            let cookie3 = resultado2.headers["set-cookie"][0]


            let resGetPurchaseFalse = await requester.get("/api/carts/" + cidAddProd + "/purchase")
                .set("Cookie", cookie3)




            expect(resGetPurchaseFalse.statusCode).to.be.equal(302)
            expect(resGetPurchaseFalse.ok).to.be.false
            expect(resGetPurchaseFalse.redirect).to.be.true


        })




















        it("Endpoint /api/carts/:cid/product/:pid, metodo DELETE, elimina el campo productos del carrito", async () => {

            await requester.post("/api/carts/" + cidAddProd + "/product/" + pidAddProd)
                .set("Cookie", cookie)


            let resDeleteProd = await requester.delete("/api/carts/" + cidAddProd + "/product/" + pidAddProd)
                .set("Cookie", cookie)


            expect(resDeleteProd.statusCode).to.be.equal(201)
            expect(resDeleteProd.ok).to.be.true
            expect(resDeleteProd._body.productsDelete).to.exist
            expect(resDeleteProd._body.ProductoEliminado).to.exist

        })


        it("Endpoint /api/carts/:cid, metodo DELETE, elimina el campo cart", async () => {

            await requester.post("/api/carts/" + cidAddProd + "/product/" + pidAddProd)
                .set("Cookie", cookie)


            let resDeleteCart = await requester.delete("/api/carts/" + cidAddProd)
                .set("Cookie", cookie)

            expect(resDeleteCart.statusCode).to.be.equal(201)
            expect(resDeleteCart.ok).to.be.true
            expect(resDeleteCart._body.UpdateProduct.products).to.exist.and.to.be.an("Array")
            expect(resDeleteCart._body.ProductoEliminado).to.exist

        })




    })



})