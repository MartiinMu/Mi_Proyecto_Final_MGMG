import mongoose from 'mongoose'
import paginate from 'mongoose-paginate-v2'



const ticketsColeccion = 'tickets'
const ticketsEsquema = new mongoose.Schema(
    {

        id:mongoose.Schema.Types.ObjectId,
        code: {
            type: String, unique: true
        },
        purchase_datetime: {
            type: Date,
            default: Date.now
        },
        amount: Number,
        purchaser: String,
        products:Array

    },

    {
        timestamps: true,
        strict: false
    }
)

ticketsEsquema.plugin(paginate)





export const ticketsModelo = mongoose.model(ticketsColeccion, ticketsEsquema)