import { randomUUID } from 'node:crypto'
import { extname, resolve } from 'node:path'

import { FastifyInstance } from 'fastify'
import { createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'

const pump = promisify(pipeline)

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/upload', async (request, reply) => {
    const upload = await request.file({
      // limits - permite configurar o tamanho do arquivo que eu quero permitir
      limits: {
        fileSize: 5_242_8800, // 5mb
      },
    })
    if (!upload) {
      return reply.status(400).send
    }

    const mimeTypeRegex = /^(iamge|video)\/[a-zA-Z]+/
    // mimetype => categorização global de tipos de arquivo
    const isValidFileFormat = mimeTypeRegex.test(upload.mimetype)

    if (!isValidFileFormat) {
      // se retornar falso, o regex rejeitou, porque não é imagem nem vídeo
      return reply.status(400).send
    }
    const fileId = randomUUID()
    // vai gerar um id universal
    const extension = extname(upload.filename)
    // extname me retorna a extensão de um arquivo
    const fileName = fileId.concat(extension)

    // streaming
    // não preciso carregar todo o arquivo de uma vez
    const writeStream = createWriteStream(
      resolve(__dirname, '../../uploads/', fileName),
      // __dirname => vai retornar qual o diretorio que este aquivo upload.ts está

      // vai padronizar os caminhos para que todos os sistemas operacionais entendam
    )
    await pump(upload.file, writeStream)

    const fullUrl = request.protocol.concat('://').concat(request.hostname)
    // request.protocol = https
    // hostname=> localhost o dominio da nossa aplicação
    const fileUrl = new URL(`/uploads/${fileName}`, fullUrl).toString

    return { fileUrl }
  })
}
