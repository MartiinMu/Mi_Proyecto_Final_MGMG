import { cartDAO as DAO } from "../dao/cartsMongoDAO.js";



class cartServices{
    constructor(dao){
    this.dao=new dao()
}

async getCart(){
    return await this.dao.get()
}
async getOneCart(filter,option){
    return await this.dao.getOne(filter,option)
}

async getOneCartPopulate(filter,populate){
    return await this.dao.getOneWithPopulate(filter, populate)
}

async getByIdProjection(filter,projection){
    return await this.dao.getByIdWithProjection(filter, projection)
}

async creatCart(cart){
    return await this.dao.create(cart)
}

async updateOneCart(filter,update,option){
    return await this.dao.updateOne(filter,update,option)
}
async findUpdate(filter,update,option){
    return await this.dao.findAndUpdate(filter,update,option)
}
async getPaginate(){
    return await this.dao.getWithPaginate()
}

}

export const CartService = new cartServices(DAO)
