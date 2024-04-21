import { fakerES_MX as faker } from '@faker-js/faker'


export const generaProducto =()=>{
    let id = faker.database.mongodbObjectId()
    let title = faker.commerce.product()
    let description = faker.commerce.productDescription()
    let category=faker.commerce.productName()
    let price = faker.number.float({min:800, max:8300, fractionDigits: 2})
    let thumbnails = faker.image.url()
    let code = faker.string.alphanumeric(6)
    let stock = faker.number.float({min:0, max:100, fractionDigits:0})
    let status = true

    return {
        id, title, description,category, price, thumbnails, code,stock, status
    }
}

let producto = generaProducto()

