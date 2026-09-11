const swaggerAutogen = require('swagger-autogen')()

const outputFile = './swagger_output.json'
const endpointsFiles = [
    './src/notifications/NotificationsController',
]

const doc = {
    info: {
        version: "1.0.0",
        title: "Integrador Dominio Contabil",
        description: "Documentação para front-end consumir API do integrador."
    },
    host: "localhost:8000",
    basePath: "/",
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
        JWT: {
            type: "apiKey",
            name: "x-access-token",
            in: "header"
        },
    },
}

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./index.js')
})