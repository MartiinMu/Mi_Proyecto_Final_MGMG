import { UserService } from "../Services/users.service.js";
import mongoose from "mongoose";
import { CustomError } from "../Utils/CustomErros.js";
import { TIPOS_ERROR } from "../Utils/TypesErros.js";
import { errorIdMongoose } from "../Utils/Errors.js";
import { enviarEmail, generaToken, validacionIdMongoose, verifyToken } from "../utils.js";

import moment from "moment";
import fs from 'fs'
import path from "path";
import { UserFilter } from "../DTO/userDTO.js";


export class UserController {
    constructor() { }


    static async putChangeRol(req, res) {

        let uid = req.params.uid

        let { rol, rol2 } = req.body
 
        let user

        try {

            user = await UserService.getOneUser({ _id: uid })


        } catch (error) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(500).json({ error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`, detalle: error.message })

        }


        let { _id, first_name, last_name, email, age, password, cart } = user

        let userEmail = user.email


        if (rol2) {
            rol = rol2
        }


        let resultado = await UserService.updateOneUser({ _id: uid }, { _id, first_name, last_name, email, age, password, cart, rol })


        if (rol2) {

            return res.redirect(`/api/users/changeanddelete?mensaje=Cambiaste el rol del usuario con email ${userEmail} al rol ${rol}  `)
        }

        return res.redirect(`/?mensaje=Cambiaste el rol del usuario con email ${userEmail} al rol ${rol}  `)

















    }


    static async postDocument(req, res) {


        let usuarioCookie = req.cookies.coderCookie
        usuarioCookie = verifyToken(usuarioCookie)

        let id = usuarioCookie._id

        let archivoSubido = req.file
        let destino = req.body.tipoDocumento


        if (destino == '' || archivoSubido == undefined || archivoSubido == null) {

            const carpetaAEliminar = './garbage';
            let archivos
            try {
                archivos = fs.readdirSync(carpetaAEliminar);

            } catch (error) {
                console.error('Error al leer la carpeta:', error);
            }

            archivos.forEach((archivo) => {
                const rutaArchivo = path.join(carpetaAEliminar, archivo);

                try {
                    fs.unlinkSync(rutaArchivo);

                } catch (error) {
                    console.error(`Error al eliminar el archivo ${archivo}:`, error);
                }
            });


            return res.redirect('/api/users/' + id + '/documents/?error=Error! fallo seleccionar documento o no se ingreso un archivo')

        } else {
            res.redirect('/api/users/' + id + '/documents/?mensaje=El Archivo se cargo correctamente')
        }


    }

    static async getDocument(req, res) {

        let { error, mensaje } = req.query
        let usuarioCookie = req.cookies.coderCookie
        usuarioCookie = verifyToken(usuarioCookie)

        let id = usuarioCookie._id

        const esSolicitudJSON = req.headers['content-type'] === 'application/json';

        if (esSolicitudJSON) {
            res.status(200).json({ archivoOne });
        } else {


            res.status(201).render('documents', { usuarioCookie, id, error, mensaje })
        }


    }


    static async getUsuers(req, res) {


        let users = await UserService.getUser()

        users = users.map(usuario => new UserFilter(usuario));



        const esSolicitudJSON = req.headers['content-type'] === 'application/json';

        res.status(200).json({ users });


    }



    static async deleteofflineusers(req, res) {

        let users = await UserService.getUser()

        let fechaHoraActual = moment()
        let emailSend
        let emailUser
        let deleteUsers
        let deletemessage



        for (let i = 0; i < users.length; i++) {
            let Ultimaconeccion = users[i].last_connection
            emailUser = users[i].email


            if (!Ultimaconeccion) {
                Ultimaconeccion = users[i].FechaUltMod

            }

            Ultimaconeccion = moment(Ultimaconeccion, 'YYYY-MM-DD HH:mm:ss')


            let fechaHaceDosMeses = moment().subtract(2, 'months');

            const esMasRecienteQueDosMeses = Ultimaconeccion.isAfter(fechaHaceDosMeses);

            if (esMasRecienteQueDosMeses) {
                console.log('La fecha actual es más reciente que hace dos meses.');



            } else {
                console.log('La fecha actual es igual o más antigua que hace dos meses.');


                deleteUsers = await UserService.deletedUser({ email: emailUser })


                let numero = deleteUsers.deletedCount
                if (numero > 0) {

                    deletemessage = `El usuario con el email ${emailUser} fue eliminado correctamente`

                } else {
                    deletemessage = `El usuario con el email ${emailUser} NO fue eliminado correctamente`
                }





                let mensaje = `Su cuenta ha sido eliminada por no tener activadad en los ultimos 2 meses del corriente`
                let respuesta = await enviarEmail(emailUser, "SU CUENTA DE ECOMMERS HA SIDO ELIMINADA", mensaje)
                if (respuesta.accepted.length > 0) {

                    emailSend = 'El email con el mensaje de eliminacion de cuenta se envio correctamente'

                } else {
                    emailSend = 'El email con el mensaje de eliminacion de cuenta NO se envio correctamente'

                }


            }

        }


        const esSolicitudJSON = req.headers['content-type'] === 'application/json';

        res.status(200).json({ emailSend, deletemessage, deleteUsers });



    }


    static async putChangeRolOneUser(req, res) {


        let { idUser, rol2, deleteUser } = req.body
        let rol = rol2
        let idUsuario

   
        let idUser2 = req.cookies.coderCookie2
        if (idUser2) {
            idUser2 = verifyToken(idUser2)
            idUsuario = idUser2._doc._id

        }




        if (rol) {
            return res.redirect(`/api/users/changeanddelete?id=${idUsuario}&rol=${rol}`)

        } else if (deleteUser) {

            return res.redirect(`/api/users/changeanddelete?id=${idUsuario}&del=${deleteUser}`)



        } else {

            if (!validacionIdMongoose(idUser)) {
                return res.redirect(`/api/users/changeanddelete?error=El id ingresado no es correcto`)
            }
        }



        let usuario
        if (idUser) {
            usuario = await UserService.getOneUser({ _id: idUser })

            return res.redirect(`/api/users/changeanddelete?id=${idUser}`)

        }

    }




}

