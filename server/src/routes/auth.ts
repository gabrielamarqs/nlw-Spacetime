import { FastifyInstance } from 'fastify'
import axios from 'axios'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function authRoutes(app: FastifyInstance) {
  app.post('/register', async (request) => {
    const bodySchema = z.object({
      code: z.string(),
    })

    const { code } = bodySchema.parse(request.body)
    // é para validar que este código está vindo mesmo, se não da erro
    // para ver se a informação que está vindo não é nula, que é uma string mesmo

    const accessTokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        headers: {
          Accept: 'application/json',
          // forma mais famosa de requisitar dados de uma api
        },
      },
    )

    const { access_token } = accessTokenResponse.data
    // a constante vai receber a resposta da requisição

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    const userSchema = z.object({
      id: z.number(),
      login: z.string(),
      name: z.string(),
      avatar_url: z.string().url(),
    })

    const userInfo = userSchema.parse(userResponse.data)
    // user ja sabe os dados por causa do zod

    let user = await prisma.user.findUnique({
      where: {
        githubId: userInfo.id,
      },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          githubId: userInfo.id,
          login: userInfo.login,
          name: userInfo.name,
          avatarUrl: userInfo.avatar_url,
        },
      })
    }

    const token = app.jwt.sign(
      {
        // primeiro objeto
        // quais informações do usuário eu quero que estejam contidas dentro do token
        // informações publicas
        // token não é criptografado, ele só é assinado
        // informações que quero deixar visiveis na minha aplicação
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      {
        // segundo objeto
        // duas informações
        sub: user.id,
        // sub : a qual usuário pertence esta informação => informação unica sobre esse usuário
        expiresIn: '30 days',
        // quanto tempo esse token vai durar
      },
    )

    return {
      token,
    }
  })
}
