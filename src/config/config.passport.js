import passport from "passport";
import local from 'passport-local'
import { usuariosModelo } from "../dao/models/user.modelo.js";
import { creaHash, validaPassword, SECRET, lastDate } from "../utils.js";
import github from 'passport-github2'
import passportJWT from 'passport-jwt'
import { CartService } from "../Services/carts.service.js";






const buscaToken = (req) => {
    let token = null

    if (req.cookies.coderCookie) {
        token = req.cookies.coderCookie

    }

    return token
}








export const inicializarPassport = () => {


    passport.use("current", new passportJWT.Strategy(
        {
            secretOrKey: SECRET,                        //---> CLAVE
            jwtFromRequest: passportJWT.ExtractJwt.fromExtractors([buscaToken])

        },
        async (contenidoToken, done) => {
            try {

                return done(null, contenidoToken)
            } catch (error) {
                return done(error)
            }
        }
    ))


    passport.use('registro', new local.Strategy(

        {


            passReqToCallback: true, usernameField: 'email'

        },
        async (req, username, password, done) => {


            try {

                let { first_name, last_name, age, email } = req.body

                if (!first_name || !last_name || !age || !email || !password) {
                    return done(null, false)
                }

                let regMail = /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/
                if (!regMail.test(email)) {
                    return done(null, false)
                }

                let existe = await usuariosModelo.findOne({ email })
                if (existe) {
                    return done(null, false)
                }






                if (email == "adminCoder@coder.com") {



                    return done(null, false)



                } else {

                    
                    let usuario
                    let rol = "usuario"
                    let products = []
                    try {
                        password = creaHash(password)
                        let cart = await CartService.creatCart({ products })
                        cart = cart._id
                        usuario = await usuariosModelo.create({ first_name, last_name, age, email, password, cart, rol })

                        return done(null, usuario)
                    } catch (error) {
                        return done(null, false)

                    }

                }





            }
            catch (error) {
                return done(error)
            }
        }
    ))


    passport.use('login', new local.Strategy(

        {
            usernameField: 'email'

        },

        async (username, password, done) => {

            try {



                if (!username || !password) {

                    return done(null, false)
                }

                let usuario

                if (username == "adminCoder@coder.com" && password == "adminCod3r123") {

                    password = creaHash(password)
                    usuario = {
                        first_name: "admin", email: username, rol: "admin", _id: "admin"
                    }




                } else {

                    usuario = await usuariosModelo.findOne({ email: username }).lean()

                    
                    
                    if (!usuario) {
                        return done(null, false)
                    }
                    
                    if (!validaPassword(usuario, password)) {
                        
                        return done(null, false)
                        
                    }
                    
                    lastDate(usuario,username)

                }

                delete usuario.password
                return done(null, usuario)


            }
            catch (error) {
                return done(error)
            }
        }


    ))





    passport.use('github', new github.Strategy(
        {
            clientID: "Iv1.0b70111622068c74",
            clientSecret: "1e51db436d284959214693844eac70a8ae5c6f7a",
            callbackURL: "http://localhost:8080/api/sessions/callbackGithub",

        },
        async (accesToken, refreshToken, profile, done) => {
            try {


                if (profile._json.email == null) {

                    return done(null, false)
                }
                
                
                let products = []
                let usuario = await usuariosModelo.findOne({ email: profile._json.email })
                let cart = await CartService.creatCart({ products })
                cart = cart._id

                if (!usuario) {
                    let nuevoUsuario = {
                        first_name: profile._json.name,
                        email: profile._json.email,
                        rol: "usuario",
                        cart,
                        profile
                    }

                    usuario = await usuariosModelo.create(nuevoUsuario)
                }
                return done(null, usuario)



            } catch (error) {
                return done(error)
            }
        }
    ))


 






















    // configurar serializador y deserializador
    passport.serializeUser((usuario, done) => {
        return done(null, usuario._id)
    })

    passport.deserializeUser(async (id, done) => {
        let usuario
        if (id == "admin") {
            usuario = {
                first_name: "admin", email: "adminCoder@coder.com", rol: "admin"
            }
            return done(null, usuario)
        } else {

            usuario = await usuariosModelo.findById(id)
            return done(null, usuario)
        }
    })



}