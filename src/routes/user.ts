import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'

import { knex } from '../database'

export async function userRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email({ message: 'Invalid email address' }),
    })

    const { name, email } = createUserBodySchema.parse(request.body)

    const checkIfUserExists = await knex('users').where('email', email).first()

    if (checkIfUserExists) {
      return reply.status(400).send({ message: 'User already exists' })
    }

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      email,
      name,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
