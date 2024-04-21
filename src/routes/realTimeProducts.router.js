import { Router } from 'express';
export const router = Router()
import { ViewsController } from '../Controller/views.controller.js';
import { Acceso } from '../utils.js';





router.get('/home',Acceso(["ADMIN","USUARIO"]), ViewsController.home)

router.get('/realtimeproducts',Acceso(["ADMIN","USUARIO"]), ViewsController.realTimeproducts)

router.get('/carts/:cid', ViewsController.getCartById)

router.get('/products',Acceso(["ADMIN","USUARIO","PREMIUM"]), ViewsController.Products)

router.get('/products/:pid',Acceso(["ADMIN","USUARIO"]), ViewsController.getProductsById) ///---> Producto individual

router.get('/registro',Acceso(["PUBLIC"]), ViewsController.getRegistro)

router.get('/',Acceso(["PUBLIC"]), ViewsController.getLogin)

router.get('/mockingproducts',ViewsController.mockingProducts)

router.get('/loggerTest',ViewsController.loggerTest)


router.get('/recuperarClave', ViewsController.getRecuperoContraseña)

router.get('/api/users/premium/:uid', ViewsController.getChangeRol)

router.get('/api/users/changeanddelete',Acceso(["ADMIN"]),ViewsController.getChangeRolOneUser)





