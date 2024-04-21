import { ticketsModelo } from "./models/ticket.model.js"


export class tickestDAO{
    async get(){
        return ticketsModelo.find()
    }
    async getOne(filter,option){
        return await ticketsModelo.findOne(filter,option).lean()
    }
    async getOneWithPopulate(filter, populate){
        return ticketsModelo.findOne(filter).populate(populate)
    }

    async getWithPaginate(){
        return ticketsModelo.paginate()
    }

    async getByIdWithProjection(filter,projection){
        return ticketsModelo.findOne(filter).projection(projection)
    }

    
    async create (ticket) {
        return await ticketsModelo.create(ticket)
    }

    async updateOne(filter,update,option){
        return await ticketsModelo.updateOne(filter,update,option)
    }


    async findAndUpdate(filter,update,option){
        return await ticketsModelo.findOneAndUpdate(filter,update,option)
    }



}