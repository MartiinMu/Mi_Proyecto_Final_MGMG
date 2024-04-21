import __dirname, { middLog } from './utils.js';
import path from 'path';
import express from 'express';
import {engine} from 'express-handlebars';
import {Server} from 'socket.io'
import mongoose from 'mongoose'
import { messagesModelo } from './dao/models/message.model.js';
import sessions from 'express-session'
import mongoStore from 'connect-mongo'
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { inicializarPassport } from './config/config.passport.js';
import { config } from './config/config.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express'






import {router as routerProductos} from './routes/productos.routerMONGO.js'
import {router as routerCarts} from './routes/carts.routerMONGO.js'
import { router as routerRealTimeProducts } from './routes/realTimeProducts.router.js';
import { router as routerMessages } from './routes/messages.router.js';
import { router as sessionRouter } from './routes/session.router.js';
import { router as userRouter } from './routes/user.routerMONGO.js';
import { errorHandler } from './Middleware/ErrorHandler.js';









const app = express()

const option={
    definition:{
        openapi:"3.0.0",
        info:{
            title:"Documentacion API",
            version: "1.0.0",
            description: "Documentacion API"
        }
    },
    apis: ["../src/docs/*.yaml"]
}

const specs=swaggerJSDoc(option)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

app.use(middLog)
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname,'/views'));



app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(sessions(
    {
        secret:"codercoderhouse",
        resave: true, saveUninitialized: true,
        store: mongoStore.create(
            {
                mongoUrl:config.MONGO_URL,
                mongoOptions:{dbName: config.DBNAME},
                ttl:60
            }
        )
    }
))


inicializarPassport()
app.use(passport.initialize())
app.use(passport.session())

app.use('/', routerRealTimeProducts)
app.use('/api/products', routerProductos)
app.use('/api/carts', routerCarts)
app.use('/chat', routerMessages)
app.use('/api/sessions',sessionRouter)
app.use('/api/users', userRouter)


app.use(express.static(path.join(__dirname,'/public')));





const server = app.listen(config.PORT, () => {
    console.log(`Server on line en puerto ${config.PORT}`)
})


export const io=new Server(server)

app.use(errorHandler)




try {
    await mongoose.connect(config.MONGO_URL,{dbName: config.DBNAME})
    
    console.log('DB Online...!!!')
} catch (error) {
    console.log(error.message)
}


let usuarios=[]
let mensajes=[]









io.on("connection",socket =>{  
    console.log(`Se ha conectado un cliente con id ${socket.id}`)

    
    socket.on('id',nombre=>{

        usuarios.push({nombre, id:socket.id})   
        socket.broadcast.emit('nuevoUsuario',nombre)
        socket.emit("hello",mensajes)
    })

    socket.on('mensaje', datos=>{
        mensajes.push(datos)
        io.emit('nuevoMensaje', datos)


  
    messagesModelo.create({user:datos.emisor,message:datos.mensaje})
        

       


       
    })

    socket.on("disconnect",()=>{
        let usuario=usuarios.find(u=>u.id===socket.id)
        if(usuario){
            io.emit("usuarioDesconectado", usuario.nombre)
        }
    })

})


