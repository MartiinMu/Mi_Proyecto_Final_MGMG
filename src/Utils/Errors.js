import os from 'os' 



export const errorArgumentos=({datos})=>{ 

    return ` Error en argumentos: Argumentos Recibidos:  - Los argumentos recibidos son ${datos} .Argumentos Obligatorios son:  - title, description, code, price, status, stock, category, thumbnails `

}

export const errorIdMongoose=({datos})=>{ 

    return ` Error en ID: Id Recibido:  - ${datos} . Argumentos Obligatorios son:  Id Tipo mongoose`

}


export const errorIdNoEnBD=({datos})=>{ 

    return ` Error en ID: Id Recibido:  - ${datos} . El ID no se encuentra en la base de datos.`

}

export const errorUpdateIDyCODE=({datos})=>{ 

    return ` Error en Update: Datos Recibidos:  - ${datos} . No se pueden modificar la propiedades "_id" y "code"`

}

export const errorUpdate=({datos})=>{ 

    return ` Error al modificar producto:  El contador de las modificaciones es:  - ${datos} . Deberia ser mayor o igual a 0`

}


export const errorCotejoKeys=({datos, llavesejemplo})=>{ 

    return ` Ingresar propiedades:  Las propiedades ingresadas son: - ${datos} . Las permitidas son: ${llavesejemplo}`

}