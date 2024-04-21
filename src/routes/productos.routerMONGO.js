import { ProductsController } from '../Controller/products.controller.js';
import { Router } from 'express';
import { Acceso } from '../utils.js';
export const router = Router()



router.get('/', Acceso(["ADMIN","USUARIO"]),ProductsController.getProducts)


router.get('/:pid',Acceso(["ADMIN"]), ProductsController.getProduct)


router.post('/', ProductsController.postProduct)


router.put('/:pid',Acceso(["ADMIN"]), ProductsController.productUpdate)


router.delete('/:pid',Acceso(["ADMIN","PREMIUM"]), ProductsController.deleteProduct)

