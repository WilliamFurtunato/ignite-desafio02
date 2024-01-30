import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { userRoutes } from './routes/user'
import { mealsRoute } from './routes/meals'

export const app = fastify()

app.register(cookie)
app.register(userRoutes, {
  prefix: 'users',
})
app.register(mealsRoute, {
  prefix: 'meals',
})
