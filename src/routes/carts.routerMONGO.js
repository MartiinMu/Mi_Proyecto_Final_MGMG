import { CartController } from '../Controller/cart.controller.js';
import { Router } from 'express';
import { Acceso } from '../utils.js';
export const router = Router()






router.post('/',Acceso(["USUARIO"]),CartController.createCarts)


router.get('/', Acceso(["ADMIN"]),CartController.getCarts)


router.get('/:cid',Acceso(["USUARIO"]), CartController.getCartFilter)

router.get('/:cid/purchase',Acceso(["USUARIO"]), CartController.getPurchase)

 

router.post('/:cid/product/:pid',Acceso(["USUARIO","PREMIUM"]),CartController.addProduct)


router.put('/:cid',CartController.updateCart)


router.put('/:cid/product/:pid',Acceso(["USUARIO"]),CartController.updateCartProduct)


router.delete('/:cid/product/:pid',Acceso(["USUARIO"]),CartController.deleteProduct)


router.delete('/:cid',Acceso(["USUARIO"]), CartController.deleteCart)


