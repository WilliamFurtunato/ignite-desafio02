import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../app'

describe('user routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const response = await request(app.server)
      .post('/users')
      .send({
        name: 'Test User',
        email: 'test@email.com',
      })
      .expect(201)

    const cookies = response.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        description: 'Meal Test Description',
        name: 'meal test',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)
  })

  it('should be able to update a meal from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Test User',
        email: 'test@email.com',
      })
      .expect(201)

    const cookies = userResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        description: 'Meal Test Description',
        name: 'meal test',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    await request(app.server)
      .put(`/meals/${mealResponse.body.meals[0].id}`)
      .set('Cookie', userResponse.get('Set-Cookie'))
      .send({
        name: 'meal test updated',
        description: 'Meal Test Description Updated',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(204)
  })

  it('should be able to delete a meal from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Test User',
        email: 'test@email.com',
      })
      .expect(201)

    const cookies = userResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        description: 'Meal Test Description',
        name: 'meal test',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    await request(app.server)
      .delete(`/meals/${mealResponse.body.meals[0].id}`)
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(204)
  })

  it('should be able to list all meals from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Test User',
        email: 'test@email.com',
      })
      .expect(201)

    const cookies = userResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        description: 'Meal on diet Test Description',
        name: 'meal on diet test',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        description: 'Meal off diet Test Description',
        name: 'meal off diet test',
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(mealsResponse.body.meals).toHaveLength(2)
  })

  it('should be able to show a meal from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Test User',
        email: 'test@email.com',
      })
      .expect(201)

    const cookies = userResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        description: 'Meal on diet Test Description',
        name: 'meal on diet test',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    await request(app.server)
      .get(`/meals/${mealResponse.body.meals[0].id}`)
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(200)
  })

  it('should be able to get metrics from a user', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'Test User',
        email: 'test@email.com',
      })
      .expect(201)

    const cookies = userResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        description: 'Meal on diet Test Description',
        name: 'meal on diet test',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        description: 'Meal 2 on diet Test Description',
        name: 'meal 2 on diet test',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        description: 'Meal off diet Test Description',
        name: 'meal off diet test',
        isOnDiet: false,
        date: new Date(),
      })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        description: 'Meal 3 on diet Test Description',
        name: 'meal on diet test',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const metricsResponse = await request(app.server)
      .get('/meals/metrics')
      .set('Cookie', userResponse.get('Set-Cookie'))
      .expect(200)

    expect(metricsResponse.body).toEqual({
      totalMeals: 4,
      totalMealsOnDiet: 3,
      totalMealsOffDiet: 1,
      bestOnDietSequence: 2,
    })
  })
})
