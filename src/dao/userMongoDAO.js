import { usuariosModelo } from "./models/user.modelo.js"

export class UserDAO{
    async get(){
        return usuariosModelo.find()
    }
    async getOne(filter,option){
        return usuariosModelo.findOne(filter,option)
    }
    async getOneWithPopulate(filter, populate){
        return usuariosModelo.findOne(filter).populate(populate)
    }

    async getWithPaginate(){
        return usuariosModelo.paginate()
    }

    async getByIdWithProjection(filter,projection){
        return usuariosModelo.findOne(filter).projection(projection)
    }

    
    async create (cart) {
        return await usuariosModelo.create(cart)
    }

    async updateOne(filter,update,option){
        return await usuariosModelo.updateOne(filter,update,option)
    }


    async findAndUpdate(filter,update,option){
        return await usuariosModelo.findOneAndUpdate(filter,update,option)
    }

    async deleted(filter){
        return await usuariosModelo.deleteOne(filter)
    }



}