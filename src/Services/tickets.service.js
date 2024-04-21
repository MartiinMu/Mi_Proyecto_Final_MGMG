import { tickestDAO as DAO} from "../dao/ticketsMongoDAO.js";



class ticketServices{
    constructor(dao){
    this.dao=new dao()
}

async getTicket(){
    return await this.dao.get()
}
async getOneticket(filter,option){
    return await this.dao.getOne(filter,option)
}

async getOneticketPopulate(filter,populate){
    return await this.dao.getOneWithPopulate(filter, populate)
}

async getByIdProjection(filter,projection){
    return await this.dao.getByIdWithProjection(filter, projection)
}

async creatticket(ticket){
    return await this.dao.create(ticket)
}

async updateOneticket(filter,update,option){
    return await this.dao.updateOne(filter,update,option)
}
async findUpdate(filter,update,option){
    return await this.dao.findAndUpdate(filter,update,option)
}
async getPaginate(){
    return await this.dao.getWithPaginate()
}

}

export const TicketService= new ticketServices(DAO)