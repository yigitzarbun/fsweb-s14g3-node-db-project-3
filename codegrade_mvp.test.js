const request = require('supertest')
const server = require('./api/server')
const db = require('./data/db-config')
const { schemes } = require('./data/seeds/01-schemes')
const { steps } = require('./data/seeds/02-steps')

beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
beforeEach(async () => {
  await db.seed.run()
})
afterAll(async () => {
  await db.destroy()
})

test('[0] sanity check', () => {
  expect(true).not.toBe(false)
})

describe('server.js', () => {
  describe('[GET] /api/schemes', () => {
    test('[1] db\'den tüm scheme\'ler alınıyor, steps\'leri olmayan scheme\'ler de dahil (LEFT VS. INNER JOIN !!!)', async () => {
      const res = await request(server).get('/api/schemes')
      expect(res.body).toHaveLength(schemes.length)
    }, 750)
    test('[2] dönülen schemes\'lerde `scheme_id` var', async () => {
      const res = await request(server).get('/api/schemes')
      res.body.forEach((scheme) => {
        expect(scheme).toHaveProperty('scheme_id')
      })
    }, 750)
    test('[3] dönülen schemes\'lerde `scheme_name` var', async () => {
      const res = await request(server).get('/api/schemes')
      res.body.forEach((scheme) => {
        expect(scheme).toHaveProperty('scheme_name')
      })
    }, 750)
    test('[4] dönülen schemes\'lerde `number_of_steps` var', async () => {
      const res = await request(server).get('/api/schemes')
      res.body.forEach((scheme) => {
        expect(scheme).toHaveProperty('number_of_steps')
      })
    }, 750)
    test('[5] tüm schemes\'ler `scheme_id`ye göre artan olarak sıralanmış', async () => {
      const res = await request(server).get('/api/schemes')
      res.body.forEach((scheme, idx) => {
        expect(scheme.scheme_id).toBe(idx + 1)
      })
    }, 750)
    test('[6] dönülen her scheme\'de `number_of_steps` doğru geliyor', async () => {
      const res = await request(server).get('/api/schemes')
      const stepCounts = [[1, 3], [2, 2], [3, 3], [4, 3], [5, 1], [6, 4], [7, 0]]
      res.body.forEach((scheme) => {
        const count = stepCounts.find(sc => sc[0] == scheme.scheme_id)[1]
        expect(scheme.number_of_steps).toBe(count)
      })
    }, 750)
  })
  describe('[GET] /api/schemes/:scheme_id', () => {
    test('[7] dönülen scheme\'de `scheme_id` doğru geliyor', async () => {
      const res = await request(server).get('/api/schemes/2')
      expect(res.body).toHaveProperty('scheme_id', 2)
    }, 750)
    test('[8] dönülen scheme\'de `scheme_name` doğru geliyor', async () => {
      const res = await request(server).get('/api/schemes/2')
      expect(res.body).toHaveProperty('scheme_name', schemes[1].scheme_name)
    }, 750)
    test('[9] dönülen scheme\'de `steps` property dizi(array) olarak var', async () => {
      const res = await request(server).get('/api/schemes/2')
      expect(res.body.steps).toBeInstanceOf(Array)
    }, 750)
    test('[10] dönülen scheme\'de eğer scheme için step yoksa `steps` boş dizi olarak geliyor', async () => {
      const res = await request(server).get('/api/schemes/7')
      expect(res.body.steps).toBeInstanceOf(Array)
      expect(res.body.steps).toHaveLength(0)
    }, 750)
    test('[11] dönülen scheme\'de doğru sayıda step var', async () => {
      const stepCounts = [[1, 3], [2, 2], [3, 3], [4, 3], [5, 1], [6, 4], [7, 0]]
      for (let idx = 0; idx < stepCounts.length; idx++) {
        const res = await request(server).get('/api/schemes/' + stepCounts[idx][0])
        expect(res.body.steps).toHaveLength(stepCounts[idx][1])
      }
    }, 750)
    test('[12] dönülen scheme\'de her bir step içinde `step_id`, `step_number` ve `instructions` var', async () => {
      const res = await request(server).get('/api/schemes/2')
      res.body.steps.forEach(st => {
        expect(st).toHaveProperty('step_id')
        expect(st).toHaveProperty('step_number')
        expect(st).toHaveProperty('instructions')
      })
    }, 750)
    test('[13] dönülen scheme\'de stepler `step_number`a göre artan şekilde sıralanmış', async () => {
      const res = await request(server).get('/api/schemes/2')
      expect(res.body.steps).toMatchObject([
        { step_number: 1, instructions: 'collect all the sheep in Scotland' },
        { step_number: 2, instructions: 'profit' },
      ])
    }, 750)
    test('[14] olmayan bir `scheme_id` için 404 ve doğru bir hata mesajı dönüyor', async () => {
      const res = await request(server).get('/api/schemes/222')
      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('message', 'scheme_id 222 id li şema bulunamadı')
    }, 750)
  })
  describe('[GET] /api/schemes/:scheme_id/steps', () => {
    test('[15] verilen `scheme_id` için doğru sayıda stepleri dönüyor'  , async () => {
      const stepCounts = [[1, 3], [2, 2], [3, 3], [4, 3], [5, 1], [6, 4], [7, 0]]
      for (let idx = 0; idx < stepCounts.length; idx++) {
        const res = await request(server).get(`/api/schemes/${stepCounts[idx][0]}/steps`)
        expect(res.body).toHaveLength(stepCounts[idx][1])
      }
    }, 750)
    test('[16] dönen stepler `step_number`a göre artan şekilde sıralanmış', async () => {
      const res = await request(server).get('/api/schemes/2/steps')
      expect(res.body[0]).toMatchObject(
        { step_number: 1 },
      )
      expect(res.body[1]).toMatchObject(
        { step_number: 2 },
      )
    }, 750)
    test('[17] dönen steplerde `step_number`, `step_id`, `instructions` ve `scheme_name` doğru geliyor', async () => {
      const res = await request(server).get('/api/schemes/5/steps')
      expect(res.body[0]).toMatchObject(
        { step_number: 1, instructions: 'quest and quest some more', scheme_name: 'Find the Holy Grail' },
      )
    }, 750)
    test('[18] olmayan bir `scheme_id` için 404 ve doğru bir hata mesajı dönüyor', async () => {
      const res = await request(server).get('/api/schemes/222/steps')
      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('message', 'scheme_id 222 id li şema bulunamadı')
    }, 750)
  })
  describe('[POST] /api/schemes', () => {
    test('[19] veritabanında yeni bir scheme yaratılıyor', async () => {
      await request(server).post('/api/schemes').send({ scheme_name: 'foo' })
      const updatedSchemes = await db('schemes')
      expect(updatedSchemes).toHaveLength(schemes.length + 1)
    }, 750)
    test('[20] status code 201 olarak dönüyor', async () => {
      const res = await request(server).post('/api/schemes').send({ scheme_name: 'foo' })
      expect(res.status).toBe(201)
    }, 750)
    test('[21] yeni yaratılan scheme kaydını dönüyor', async () => {
      const res = await request(server).post('/api/schemes').send({ scheme_name: 'foo' })
      expect(res.body).toHaveProperty('scheme_id', 8)
      expect(res.body).toMatchObject({ scheme_name: 'foo' })
    }, 750)
    test('[22] eksik veya hatalı `scheme_name` için doğru mesajı 400 kodu ile dönüyor', async () => {
      let res = await request(server).post('/api/schemes').send({ scheme_name: null })
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('message', 'Geçersiz scheme_name')
      res = await request(server).post('/api/schemes').send({})
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('message', 'Geçersiz scheme_name')
      res = await request(server).post('/api/schemes').send({ scheme_name: 7 })
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('message', 'Geçersiz scheme_name')
    }, 750)
  })
  describe('[POST] /api/schemes/:scheme_id/steps', () => {
    test('[23] veritabanında yeni bir step yaratıyor', async () => {
      await request(server).post('/api/schemes/7/steps').send({ instructions: 'foo', step_number: 60 })
      const updatedSteps = await db('steps')
      expect(updatedSteps).toHaveLength(steps.length + 1)
    }, 750)
    test('[24] status code 201 olarak dönüyor', async () => {
      const res = await request(server).post('/api/schemes/7/steps').send({ instructions: 'foo', step_number: 60 })
      expect(res.status).toBe(201)
    }, 750)
    test('[25] verilen `scheme_id` için yenisi de dahil tüm steplerin listesini dönüyor', async () => {
      let res = await request(server).post('/api/schemes/7/steps').send({ instructions: 'foo', step_number: 60 })
      expect(res.body).toHaveLength(1)
      res = await request(server).post('/api/schemes/7/steps').send({ instructions: 'bar', step_number: 61 })
      expect(res.body).toHaveLength(2)
    }, 750)
    test('[26] `step_number`a göre artan şekilde sıralı olarak düzgün bir formatta dönüyor', async () => {
      let res = await request(server).post('/api/schemes/7/steps').send({ instructions: 'bar', step_number: 20 })
      expect(res.body).toMatchObject([{ instructions: 'bar', step_number: 20 }])
      res = await request(server).post('/api/schemes/7/steps').send({ instructions: 'foo', step_number: 10 })
      expect(res.body).toMatchObject([{ instructions: 'foo', step_number: 10 }, { instructions: 'bar', step_number: 20 }])
    }, 750)
    test('[27] eksik veya hatalı `step_number` veya `instructions` için doğru mesajı 400 kodu ile dönüyor', async () => {
      let res = await request(server).post('/api/schemes/7/steps').send({ instructions: null, step_number: 20 })
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('message', 'Hatalı step')
      res = await request(server).post('/api/schemes/7/steps').send({ instructions: 'foo', step_number: 'bar' })
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('message', 'Hatalı step')
      res = await request(server).post('/api/schemes/7/steps').send({ step_number: 20 })
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('message', 'Hatalı step')
      res = await request(server).post('/api/schemes/7/steps').send({ instructions: 'foo', step_number: -1 })
      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('message', 'Hatalı step')
    }, 750)
  })
})
