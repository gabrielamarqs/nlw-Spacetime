import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function memoriesRoutes(app: FastifyInstance) {
  app.get('/memories', async () => {
    const memories = await prisma.memory.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    })

    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt: memory.content.substring(0, 115).concat('...'),
      }
    })
  })

  app.get('/memories/:id', async (request) => {
    // const { id } = request.params

    // request.params => sempre vai ser um objeto
    // e de dentro dele vou ter acesso aos parâmetros que estão na rota

    const paramSchema = z.object({
      // paramSchema é um objeto
      // e dentro dele eu espeto um id que é uma string
      id: z.string().uuid(),
      // como eu sei que é um uuid posso usar para validar
    })

    const { id } = paramSchema.parse(request.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: {
        id,
      },
    })

    return memory
  })

  app.post('/memories', async (request) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
      // o coerce vai transformar valores que são a comparados a false (0, string vazia, etc) em false, e valores que são considerados true em true
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: '223ed65f-27fd-4bc4-8854-c8dd979246f9',
      },
    })

    return memory
  })

  app.put('/memories/:id', async (request) => {
    const paramSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramSchema.parse(request.params)

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })

    const { content, coverUrl, isPublic } = bodySchema.parse(request.body)

    const memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })

    return memory
  })

  app.delete('/memories/:id', async (request) => {
    const paramSchema = z.object({
      // paramSchema é um objeto
      // e dentro dele eu espeto um id que é uma string
      id: z.string().uuid(),
      // como eu sei que é um uuid posso usar para validar
    })

    const { id } = paramSchema.parse(request.params)

    await prisma.memory.delete({
      where: {
        id,
      },
    })
  })
}
