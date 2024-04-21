import mongoose from "mongoose";
import { expect } from "chai";


import supertest from "supertest";
import { describe, it } from "mocha";




import { config } from "../src/config/config.js";
import { verifyToken } from "../src/utils.js";
import { productService } from "../src/Services/products.service.js";



try {
    await mongoose.connect('mongodb+srv://martingustavom:Coderhouse2023@cluster0.czbpnhg.mongodb.net/?retryWrites=true&w=majority', { dbName: 'ecommerces' })

    console.log('DB Online 2...!!!')
} catch (error) {
    console.log(error.message)
}

const requester = supertest("http://localhost:8080")
let cookie
let idDelete
describe("Prueba del proyecto ecommerce", async function () {
    this.timeout(20000)

    describe("Prueba del modulo Products", async function () {


        after(async () => {
            let resultado = await mongoose.connection.collection("usuarios").deleteMany({ email: "testing@gmail.com" })
            let resultadoProductCollection = await mongoose.connection.collection("products").deleteMany({ title: "Testing" })

        })


        it("Endpoint /api/products, metodo GET, obtiene productos solicitados", async () => {

            let usuario = { first_name: "nombreTest", last_name: "apellidoTest", age: 41, email: "testing@gmail.com", password: "123" }


            let resultado1 = await requester.post("/api/sessions/registro").send(usuario)

            let usuario2 = { email: "testing@gmail.com", password: "123" }

            let resultado2 = await requester.post("/api/sessions/login")
                .send(usuario2)


            let cookie = resultado2.headers["set-cookie"][0]



            const user = { username: 'usuario1', rol: 'ADMIN' }
            let resultado3 = await requester.get("/api/products")
                .set("Cookie", cookie)

            expect(resultado3.statusCode).to.be.equal(200)
            expect(resultado3.ok).to.be.true



        })

        it("Endpoint /api/products, metodo POST, Crea un producto", async () => {


            let usuario = { email: "adminCoder@coder.com", password: "adminCod3r123" }

            let resultado = await requester.post("/api/sessions/login")
                .send(usuario)


            cookie = resultado.headers["set-cookie"][0]


            let product = { title: "Testing", description: "Descripcion Testing", code: "PS5-2209881", price: 499.99, status: true, stock: 25, category: "Gaming", thumbnails: ["https://ejemplo.com/gaming1.jpg", "https://ejemplo.com/gaming2.jpg", "https://ejemplo.com/gaming3.jpg"] }

            let resultadoPostProduct = await requester.post("/api/products")
                .set("Cookie", cookie)
                .send(product)




            expect(resultadoPostProduct.statusCode).to.be.equal(200)
            expect(resultadoPostProduct.ok).to.be.true
            expect(resultadoPostProduct._body.payload.title).to.exist.and.to.be.equal("Testing")


            let product2 = { title: "TestingDelete", description: "Descripcion TestingDelete", code: "PS5-2", price: 499.99, status: true, stock: 25, category: "Gaming", thumbnails: ["https://ejemplo.com/gaming1.jpg", "https://ejemplo.com/gaming2.jpg", "https://ejemplo.com/gaming3.jpg"] }

            let resultadoPostProductDelete = await requester.post("/api/products")
                .set("Cookie", cookie)
                .send(product2)


            idDelete = await productService.getOneProduct({ status: true, title: "TestingDelete" })
            idDelete = idDelete._id
            

        })


        it("Endpoint /api/products/:pid, metodo GET, obtiene el producto solicitado", async () => {

            let pid = "657390931218cd6c0853f691"

            let resGetProductsPid = await requester.get("/api/products/" + pid)
                .set("Cookie", cookie)


            expect(resGetProductsPid.statusCode).to.be.equal(200)
            expect(resGetProductsPid.ok).to.be.true
            expect(resGetProductsPid._body.archivoOne.title).to.exist.and.to.be.equal('Microondas con Grill')





        })



        it("Endpoint /api/products/:pid, metodo PUT, actualiza el producto solicitado", async () => {

            let pid = "657390931218cd6c0853f691"
            let numero = Math.floor(Math.random() * 90) + 10
            let productPut = { title: "Microondas con Grill", description: "MedianoTesting Nro" + numero, price: 499.99, status: true, stock: 25, category: "Electro", thumbnails: ["https://ejemplo.com/gaming1.jpg", "https://ejemplo.com/gaming2.jpg", "https://ejemplo.com/gaming3.jpg"] }

            let resPutProductsPid = await requester.put("/api/products/" + pid)
                .set("Cookie", cookie)
                .send(productPut)



            expect(resPutProductsPid.statusCode).to.be.equal(200)
            expect(resPutProductsPid.ok).to.be.true
            expect(resPutProductsPid._body.payload).to.exist.and.to.be.equal('Modificacion realizada')

        })



        it("Endpoint /api/products/:pid, metodo DELETE, elimina el producto solicitado", async () => {

            let pid = idDelete
         
            let resDeleteProductsPid = await requester.delete("/api/products/" + pid)
                .set("Cookie", cookie)
                



                expect(resDeleteProductsPid.statusCode).to.be.equal(200)
                expect(resDeleteProductsPid.ok).to.be.true
                expect(resDeleteProductsPid._body.payload).to.exist.and.to.be.equal('Eliminacion realizada')

        })



    })






})