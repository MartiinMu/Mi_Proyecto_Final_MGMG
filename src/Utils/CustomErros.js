export class CustomError extends Error{ 
    constructor(nombre, mensaje, codigo=500, descrip=""){
        super(mensaje)
        this.name=nombre
        this.codigo=codigo
        this.descrip=descrip
    }
}





