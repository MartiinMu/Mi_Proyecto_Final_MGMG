import { Router } from 'express'
import { creaHash, enviarEmail, generaToken, lastDateLogout, validaPassword, verifyToken } from '../utils.js'
export const router = Router()
import passport from 'passport'
import { UsuariosReadDTO } from '../DTO/userDTO.js'


import { UserService } from '../Services/users.service.js'






router.get('/errorLogin', (req, res) => {
    return res.redirect('/?error=Error en el proceso de registro')
})


router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/errorLogin' }), async (req, res) => {


    let token = generaToken(req.user)
    res.cookie("coderCookie", token, { httpOnly: true, maxAge: 1000 * 60 * 60 })




    res.redirect('/products')

})






router.get('/errorRegistro', (req, res) => {
    return res.redirect('/registro?error=Error en el proceso de registro')
})

router.post('/registro', passport.authenticate('registro', { failureRedirect: '/api/sessions/errorRegistro' }), async (req, res) => {


    let { email } = req.body


    res.redirect(`/?mensaje=Usuario ${email} registrado correctamente`)


})






router.get('/logout', (req, res) => {
    let usuario = req.cookies.coderCookie
    if(usuario) lastDateLogout(usuario)

    req.session.destroy(error => {
        if (error) {
            res.redirect('/?error=fallo en el logout')
        }
    })

    res.clearCookie('coderCookie')
    res.clearCookie('coderCookie2')
    res.clearCookie('connect.sid')

    res.redirect('/')

});



router.get('/github', passport.authenticate('github', {}), (req, res) => { })

router.get('/callbackGithub', passport.authenticate('github', { failureRedirect: "/api/sessions/errorGithub" }), (req, res) => {


    

    let token=generaToken(req.user)
    
    let cookie = res.cookie("coderCookie", token, {httpOnly:true, maxAge: 1000*60*60})

    
   

    res.redirect('/products')

})

router.get('/errorGithub', (req, res) => {

    return res.redirect('/?error=Configurar Github con un email publico')



});







router.get('/errorCurrent', (req, res) => {
    return res.redirect('/?error=Error inesperado')
})


router.get('/current', passport.authenticate('current', { session: false, failureRedirect: '/api/sessions/errorCurrent' }), (req, res) => {

    

    let usuario = req.cookies.coderCookie
    usuario = verifyToken(usuario)
    usuario = new UsuariosReadDTO(usuario)

    


    res.setHeader('Content-Type', 'text/html')
    res.status(200).render('current', { usuario })
})











router.post('/recuperarClave', async (req, res) => {

   

    let { contraseña1, contraseña2 } = req.body

    let { email } = req.body
    if (email) {

        let usuario = await UserService.getOneUser({ email: email })
        

        if (!usuario) {
            return res.redirect('/recuperarClave?error=Error: email no coincide')
        }


        delete usuario.password


        let token = generaToken(usuario)

        let mensaje = `Ha solicitado reiniciar su contraseña.
        Si no fue ud. por favor desestime estemensaje. De lo contrario haga click en este link <a href="http://localhost:8080/recuperarClave?token=${token}"> Resetear contraseña</a> .`


        let respuesta = await enviarEmail(email, "RECUPERO DE CLAVE", mensaje)

        if (respuesta.accepted.length > 0) {

            return res.redirect(`/?mensaje=Se envio un email al correo ${email} con los pasos para recuperar la clave`)
        } else {
            return res.redirect("/?error=Error al intentar recuperar contraseña")

        }



    }





    let token = req.cookies.cookieToken



    if (!contraseña1 && !contraseña2) {
        return res.redirect(`/recuperarClave?token=${token}&error=Debe ingresar ambas contraseñas`)
    }


    if (contraseña1 !== contraseña2) {
        return res.redirect(`/recuperarClave?token=${token}&error=Las contraseñas no coinciden. Deben ser iguales.`)

    }



    let datosToken
    try {

        datosToken = verifyToken(token)
    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            console.log('El token ha expirado.');
        } else {
            console.log('Error al verificar el token:', e.message);
        }
    }


    if (!datosToken) {
        return res.redirect('/recuperarClave?error=Expiro el tiempo para recuperar la clave, intente nuevamente')
    }


    
    datosToken = verifyToken(token)
    if(datosToken._doc){ datosToken = datosToken._doc }
    
        
    let usuario = await UserService.getOneUser({ email: datosToken.email })

    let passAnterior = validaPassword(usuario, contraseña1)


    if (passAnterior) {

        return res.redirect(`/recuperarClave?token=${token}&error=Ha ingresado una contraseña utilizada en el pasado. No esta permitido intente con otra`)
    }

    let newPassword = creaHash(contraseña1)




    let { _id, first_name, last_name, age, password, cart, rol } = usuario

    let usuarioActualizado = {
        _id,
        first_name,
        last_name,
        email: datosToken.email,
        age,
        password: newPassword,
        cart,
        rol
    }



    await UserService.findUpdate({ email: datosToken.email }, usuarioActualizado)

    return res.redirect(`/?mensaje=La clave fue cambiada con exito`)














})