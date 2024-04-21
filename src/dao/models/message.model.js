import mongoose from "mongoose";



const messagesColeccion = 'messages'
const messagesEsquema = new mongoose.Schema(
    {

        user:{
            type: String,
        },
        message: {
            type:String,
        }

    },

    {
        timestamps: true,
        strict: false
    }
)



export const messagesModelo = mongoose.model(messagesColeccion, messagesEsquema)