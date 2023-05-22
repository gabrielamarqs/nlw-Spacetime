import { api } from '@/lib/api'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  const registerResponse = await api.post('/register', {
    code,
    // o que essa rota retorna?
    // retorna o token
  })

  const redirectTo = request.cookies.get('redirectTo')?.value

  const { token } = registerResponse.data

  console.log(token)

  const redirectUrl = redirectTo ?? new URL('/', request.url)
  // se existir redirectTo eu mando pra essa página, se não mando pra root

  // vai redirecionar pra rota root da minha aplicação

  const cookieExpireInSeconds = 60 * 60 * 24 * 30

  return NextResponse.redirect(redirectUrl, {
    headers: {
      'Set-Cookie': `token=${token}; Path=/; max-age=${cookieExpireInSeconds};`,
      // significa que este cookie/token vai estar disponível em toda a aplicação
    },
  })
}
