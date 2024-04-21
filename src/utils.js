import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import passport from 'passport';
import winston from 'winston'
import { config } from './config/config.js';
import nodemailer from "nodemailer"
import { UserService } from './Services/users.service.js';
import moment from 'moment';
import { usuariosModelo } from './dao/models/user.modelo.js';

import multer from 'multer'
import path from 'path';

import fs from 'fs'
import mongoose from 'mongoose';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;
export const SECRET = "Coder12345"






export const creaHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10))
export const validaPassword = (usuario, password) => bcrypt.compareSync(password, usuario.password)







export const passportCall = (estrategia) => {
  return function (req, res, next) {
    passport.authenticate(estrategia, function (err, user, info, status) {
      if (err) { return next(err) }
      if (!user) {
        return res.errorCliente(info.message ? info.message : info.toString())
      }
      req.user = user
      return next()
    })(req, res, next);
  }
}

export const generaToken = (usuario) => jwt.sign({ ...usuario }, SECRET, { expiresIn: "1h" })
export const verifyToken = (usuario) => jwt.verify(usuario, SECRET)





export const auth = (req, res, next) => {

  if (!req.cookies.coderCookie) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(401).json({ error: `Usuario no autenticado` })
  }

  let token = req.cookies.coderCookie


  try {
    let usuario = jwt.verify(token, SECRET)
    req.user = usuario
    next()
  } catch (error) {
    return res.status(401).json({ error })
  }

}



export const Acceso = (permisos = []) => {
  return (req, res, next) => {
    permisos = permisos.map(p => p.toLowerCase())


    let rolUser = req.cookies
 


    if(!req.cookies.coderCookie){
      rolUser = {rol:"public"}
    } else{
      
      rolUser = verifyToken(rolUser.coderCookie)
      
    }
    rolUser.rol.toLowerCase()
    

     if (permisos.includes("public")) {
      return next()
    }

    if (!rolUser || !rolUser.rol) {
      return res.status(403).json({ message: "No hay usuarios logueados" })
    }

    if (!permisos.includes(rolUser.rol)) {
      return res.status(403).json({ message: "No tiene privilegios suficientes para acceder a este recurso." })
    }

    return next()
  }
}































const logger = winston.createLogger(
  {
    levels: { debug: 5, http: 4, info: 3, warning: 2, error: 1, fatal: 0 },
    transports: [
      new winston.transports.Console(
        {
          level: "info",
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.simple()
          )

        }
      ),
      new winston.transports.File(
        {
          level: "error",
          filename: "./src/logs/errors.log",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        }
      )
    ]
  }
)



const loggerProduccion = winston.createLogger(
  {
    levels: { debug: 5, http: 4, info: 3, warning: 2, error: 1, fatal: 0 },
    transports: [
      new winston.transports.Console(
        {
          level: "error",
          format: winston.format.combine(
            winston.format.colorize({
              colors: { error: "red", fatal: "red" }

            }),
            winston.format.simple()

          )
        }
      )
    ]
  }
)



let loggers
if (config.MODE === "produccion") {
  loggers = loggerProduccion

}
else if (config.MODE === "desarrollo") {
  loggers = logger

}





export const middLog = (req, res, next) => {
  req.logger = loggers
  next()
}



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

export const enviarEmail = (to, subject, message) => {
  return transport.sendMail(
    {
      to, subject,
      html: message
    }
  )
}


export const lastDate = async (usuario, username) => {

  let fechaActual
  if (usuario.last_connection) {
    fechaActual = moment().format('YYYY-MM-DD HH:mm:ss')
    usuario.last_connection = fechaActual
    await UserService.findUpdate({ email: username }, { $set: { last_connection: fechaActual } })
    usuario = await usuariosModelo.findOne({ email: username }).lean()



  } else if (!usuario.last_connection || usuario.last_connection == null || usuario.last_connection == undefined){
    fechaActual = moment().format('YYYY-MM-DD HH:mm:ss')
    usuario.last_connection = fechaActual
    await UserService.findUpdate({ email: username }, { $set: { last_connection: fechaActual } })
    usuario = await usuariosModelo.findOne({ email: username }).lean()


  }

  

}



export const lastDateLogout = async (usuario) => {


  usuario = verifyToken(usuario)

  let username = usuario.email


  let fechaActual
  if (usuario.last_connection) {
    fechaActual = moment().format('YYYY-MM-DD HH:mm:ss')
    usuario.last_connection = fechaActual
    await UserService.findUpdate({ email: username }, { $set: { last_connection: fechaActual } })
    usuario = await usuariosModelo.findOne({ email: username }).lean()


  } else {
    fechaActual = moment().format('YYYY-MM-DD HH:mm:ss')
    usuario.last_connection = fechaActual
    await UserService.findUpdate({ email: username }, { $set: { last_connection: fechaActual } })
    usuario = await usuariosModelo.findOne({ email: username }).lean()

  }


}



const storage = multer.diskStorage({

  destination: function (req, file, cb) {

  

    let destino = req.body.tipoDocumento

    if (destino == "ImgProfile") {
      cb(null, path.join(__dirname, 'profile'))
    } else if (destino == "ImgProduct") {
      cb(null, path.join(__dirname, 'products'))
    } else if (destino == "Identifiacion") {
      cb(null, path.join(__dirname, 'documents'))
    } else if (destino == "Adress") {
      cb(null, path.join(__dirname, 'documents'))
    } else if (destino == "statusAccount") {
      cb(null, path.join(__dirname, 'documents'))
    } else {
      cb(null, path.join(__dirname, 'garbage'))
    }

  },
  filename: function (req, file, cb) {



    let idUser = req.params.uid
    let destino = req.body.tipoDocumento

    if (destino == "ImgProduct") {

      const carpeta = '../src/products';
      let archivos
      let lastValueFile
      try {
        archivos = fs.readdirSync(carpeta);

        const archivosFiltrados = archivos.filter((archivo) => {
          return fs.statSync(path.join(carpeta, archivo)).isFile();
        });



        let emptyArchivos = archivos[0]
    
        if (emptyArchivos == undefined) {
          lastValueFile = 1

        } else {




          lastValueFile = archivos[archivos.length - 1]
          lastValueFile = lastValueFile.split("-")[2]
          lastValueFile = parseInt(lastValueFile) + 1

        }


      } catch (error) {
        console.error('Error al leer la carpeta:', error);
      }

      cb(null, idUser + '-' + destino + '-' + lastValueFile+".jpg");
    } else {
      cb(null, idUser + '-' + destino + ".jpg");
    }
  }
});

export const profile = multer({ storage: storage })



export const validacionIdMongoose = (id) => mongoose.Types.ObjectId.isValid(id)