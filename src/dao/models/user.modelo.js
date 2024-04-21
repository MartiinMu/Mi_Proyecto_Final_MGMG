import mongoose from "mongoose";



const usuariosEsquema=new mongoose.Schema(
    {
        first_name: String,
        last_name: String,
        email: {
            type: String, unique: true
        },
        age:Number,
        password: String,
        cart: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'carts'
        },
        rol: String,
        documents: [
            {
                name: String,
                reference: String,
            }],
        last_connection:String
    },
    
    {
        timestamps: {
            updatedAt: "FechaUltMod", createdAt: "FechaAlta"
        }
    }
)











export const usuariosModelo=mongoose.model("usuarios", usuariosEsquema)