import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import { memoriesRoutes } from './routes/memories'
import 'dotenv/config'
import { authRoutes } from './routes/auth'
import multipart from '@fastify/multipart'
import { uploadRoutes } from './routes/upload'
import { resolve } from 'path'

const app = fastify()

app.register(multipart)

app.register(require('@fastify/static'), {
  root: resolve(__dirname, '../uploads'),
  // em qual pasta vão estar os arquivo que queremos que sejam esáticos
  prefix: '/uploads',
})

app.register(cors, {
  origin: true, // todas URLs de front-end poderão acessar nosso back-end
})

app.register(jwt, {
  secret: 'spacetime',
  // maneira de diferenciar os jwt gerados por esse back-end de outros jwt de outros back-end
  // uma forma de criptografar o token
  // ele vai ser assinado com a palavra spacetime
  // uma string que não possa ser facil de ser encontrado nem decifrado
})

app.register(authRoutes)
app.register(memoriesRoutes)
// serve para registrar um arquivo de rotas separado
app.register(uploadRoutes)

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('HTTP server running on http://localhost:3333')
  })
