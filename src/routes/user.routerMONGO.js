import { Router } from "express";
import { Acceso, profile } from "../utils.js";
import { UserController } from "../Controller/user.controller.js";
export const router = Router()


router.post('/premium/:uid',Acceso(["ADMIN"]),UserController.putChangeRol)

router.post('/:uid/documents',Acceso(["USUARIO","PREMIUM"]),profile.single('profile'),UserController.postDocument)

router.get('/:uid/documents',Acceso(["USUARIO","PREMIUM"]),UserController.getDocument)

router.get('/users',UserController.getUsuers)


router.delete('/offlineusers', UserController.deleteofflineusers)


router.post('/changeanddelete', UserController.putChangeRolOneUser)