import mongoose from "mongoose";
import { expect } from "chai";


import supertest from "supertest";
import { describe, it } from "mocha";




import { config } from "../src/config/config.js";
import { verifyToken } from "../src/utils.js";



try {
    // await mongoose.connect(config.MONGO_URL,{dbName: config.DBNAME})
    await mongoose.connect('mongodb+srv://martingustavom:Coderhouse2023@cluster0.czbpnhg.mongodb.net/?retryWrites=true&w=majority', { dbName: 'ecommerces' })

    console.log('DB Online 2...!!!')
} catch (error) {
    console.log(error.message)
}

const requester = supertest("http://localhost:8080")
let cookie

describe("Prueba del proyecto ecommerce", async function () {
    this.timeout(20000)

    describe("Prueba del modulo Sessions", async function () {


        after(async () => {
            let resultado = await mongoose.connection.collection("usuarios").deleteMany({ email: "testing@gmail.com" })
        })


        it("Endpoint /api/sessions/registro, metodo POST, crea un usuario", async () => {

            let usuario = { first_name: "nombreTest", last_name: "apellidoTest", age: 41, email: "testing@gmail.com", password: "123" }


            let { statusCode, body, ok, redirect, ...resto } = await requester.post("/api/sessions/registro").send(usuario)


            expect(statusCode).to.be.equal(302)
            expect(redirect).to.be.true


        })

        it("Endpoint /errorRegistro, metodo GET, se cumple el error de datos invalidos", async () => {

            let usuario = { last_name: "apellidoTest", age: 41, email: "testing@gmail.com", password: "123" }

            let response1 = await requester.post("/api/sessions/registro").send(usuario)

            
            expect(response1.statusCode).to.be.equal(302)
            expect(response1.redirect).to.be.true
            
            
            
            let response2 = await requester.get("/registro").query({ error: "Error en el proceso de registro" })
            
            expect(response2.statusCode).to.be.equal(200)
            expect(response2.ok).to.be.true


        })

        it("Endpoint /api/sessions/login, metodo POST, se ingreso correctamente", async () => {

            let usuario = { email: "testing@gmail.com", password: "123" }

            let { statusCode, body, ok, redirect, headers, res, ...resto } = await requester.post("/api/sessions/login").send(usuario)

            expect(statusCode).to.be.equal(302)
            expect(redirect).to.be.true
            cookie = headers["set-cookie"][0].split("=")
            let nombreCookie = cookie[0]
            cookie = cookie[1].split(";")[0]
            // console.log(cookie)

            expect(nombreCookie).to.be.equal("coderCookie")


        })


        it("Endpoint /errorLogin, metodo GET, se cumple el error de datos invalidos", async () => {

            let usuario = { email: "testin@hotmail.com", password: "123" }

            let response1 = await requester.post("/api/sessions/login").send(usuario)
            expect(response1.statusCode).to.be.equal(302)
            expect(response1.redirect).to.be.true



            let response2 = await requester.get("/")
                .query({ error: "Error en el proceso de registro" })

            expect(response2.statusCode).to.be.equal(200)
            expect(response2.ok).to.be.true


        })


        it("Endpoint /api/sessions/current, metodo GET, devuleve datos del perfil del usuario correctamente", async () => {
            cookie = `coderCookie=` + cookie


            let { body, statusCode, ok, ...resto } = await requester.get("/api/sessions/current")
                .set("cookie", cookie)



            // console.log(resto)



            expect(statusCode).to.be.equal(200)
            expect(ok).to.be.true




        })


        it("Endpoint /api/sessions/logout, metodo GET, se desloguea correctamente", async () => {

            let { statusCode, body, ok, redirect, headers, res, ...resto } = await requester.get("/api/sessions/logout")
                .set("cookie", cookie)

            let destroyedCookie = headers["set-cookie"][0].split(";")[0]


            expect(redirect).to.be.true
            expect(statusCode).to.be.equal(302)
            expect(destroyedCookie).to.be.equal("coderCookie=")


        })


        it("Endpoint /api/sessions/github, metodo GET, se loguea con Github", async () => {

            let { statusCode, body, ok, redirect, headers, res, ...resto } = await requester.get("/api/sessions/github")
                .set("cookie", cookie)


            expect(redirect).to.be.true
            expect(statusCode).to.be.equal(302)



        })


        it("Endpoint /api/sessions/recuperarClave, metodo POST, Envia un email al email solicitado para recuperar la clave", async () => {

            let resultado = await requester.post("/api/sessions/recuperarClave")
                .set("cookie", cookie)


            expect(resultado.redirect).to.be.true
            expect(resultado.statusCode).to.be.equal(302)




        })


        it("Endpoint /recuperarClave?token=, metodo GET, recibe el token del email del recupero de clave y cambia de contraseña", async () => {



            let cookieToken = cookie.split("=")[1]
            let cookieTokenValue = cookieToken
            cookieToken = `cookieToken=` + cookieToken


            let { statusCode, body, ok, redirect, headers, res, ...resto } = await requester.get("/recuperarClave")
                .query({ token: cookieTokenValue })
                .set("cookie", cookieToken)

            expect(statusCode).to.be.equal(200)
            expect(ok).to.be.true




            let respuesta1 = await requester.post("/api/sessions/recuperarClave")
                .query({ token: cookieTokenValue })
                .set("cookie", cookieToken)
                .send({ contraseña1: "123456", contraseña2: "123456" })

            expect(respuesta1.statusCode).to.be.equal(302)
            expect(respuesta1.redirect).to.be.true

        })



    })


    


})