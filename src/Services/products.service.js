import { productDAO as DAO } from "../dao/productMongoDAO.js";

class ProductService{
    constructor(dao){
        this.dao=new dao()
    }

    async getProduct(filter){
        return await this.dao.get(filter)
    }

    async getOneProduct(filter){
        return await this.dao.getOneProd(filter)

    }

    async getOneProductPopulate(filter,populate){
        return await this.dao.getOneWithPopulate(filter, populate)
    }

    async getByIdProjection(filter,projection){
        return await this.dao.getByIdWithProjection(filter, projection)
    }
    
    async createProduct(Product){
        return await this.dao.create(Product)
    }
    
    async updateOneProduct(filter,update,option){
        return await this.dao.updateOne(filter,update,option)
    }
    async findUpdate(filter,update,option){
        return await this.dao.findAndUpdate(filter,update,option)
    }
    async getPaginate(query,option,callback){
        return await this.dao.getWithPaginate(query,option,callback)
    }

    async deletedProduct(filter){
        return await this.dao.deleted(filter)

    }







}


export const productService = new ProductService(DAO)