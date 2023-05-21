import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  // quando fazer requisição não preciso definir o URL inteiro, só o que vem depois
})
// definindo a rota padrão do meu back-end
