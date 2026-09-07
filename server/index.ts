import 'dotenv/config'
import express from 'express'
import { MongoClient } from 'mongodb'
import { defaultAccounts, defaultSchoolData, type Account, type SchoolData } from '../src/lib/database.js'

const app = express()
const port = Number(process.env.PORT ?? 3001)
const mongoUri = process.env.MONGODB_URI
const databaseName = process.env.MONGODB_DB ?? 'educampus'

if (!mongoUri) {
  throw new Error('MONGODB_URI is required to start the API server.')
}

const client = new MongoClient(mongoUri)
const database = client.db(databaseName)
type SchoolDataDocument = SchoolData & { _id: string }

const schoolDataCollection = database.collection<SchoolDataDocument>('schoolData')
const accountsCollection = database.collection<Account>('accounts')

const initializeDatabase = async () => {
  await schoolDataCollection.updateOne(
    { _id: 'default' },
    { $setOnInsert: defaultSchoolData },
    { upsert: true },
  )

  for (const account of defaultAccounts) {
    await accountsCollection.updateOne(
      { $or: [{ username: account.username }, { email: account.email }] },
      { $setOnInsert: account },
      { upsert: true },
    )
  }
}

app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ ok: true })
})

app.get('/api/school-data', async (_request, response) => {
  const record = await schoolDataCollection.findOne({ _id: 'default' })
  if (!record) {
    response.status(404).json({ message: 'School data has not been created yet.' })
    return
  }

  const { _id: _ignoredId, ...schoolData } = record
  response.json(schoolData)
})

app.put('/api/school-data', async (request, response) => {
  const schoolData = request.body as SchoolData
  await schoolDataCollection.updateOne(
    { _id: 'default' },
    { $set: schoolData },
    { upsert: true },
  )
  response.json(schoolData)
})

app.get('/api/accounts', async (_request, response) => {
  const accounts = await accountsCollection.find({}, { projection: { _id: 0 } }).toArray()
  response.json(accounts)
})

app.post('/api/accounts', async (request, response) => {
  const account = request.body as Account
  const existing = await accountsCollection.findOne({
    $or: [{ username: account.username }, { email: account.email }],
  })

  if (existing) {
    response.status(409).json({ message: 'That username or email is already registered.' })
    return
  }

  await accountsCollection.insertOne(account)
  const accounts = await accountsCollection.find({}, { projection: { _id: 0 } }).toArray()
  response.status(201).json(accounts)
})

app.post('/api/migrate', async (request, response) => {
  const schoolData = (request.body.data ?? defaultSchoolData) as SchoolData
  const accounts = (request.body.accounts?.length ? request.body.accounts : defaultAccounts) as Account[]

  await schoolDataCollection.updateOne(
    { _id: 'default' },
    { $setOnInsert: schoolData },
    { upsert: true },
  )

  for (const account of accounts) {
    await accountsCollection.updateOne(
      { $or: [{ username: account.username }, { email: account.email }] },
      { $setOnInsert: account },
      { upsert: true },
    )
  }

  const savedSchoolRecord = await schoolDataCollection.findOne({ _id: 'default' })
  const savedAccounts = await accountsCollection.find({}, { projection: { _id: 0 } }).toArray()
  const { _id: _ignoredId, ...savedSchoolData } = savedSchoolRecord ?? { _id: 'default', ...schoolData }

  response.json({ data: savedSchoolData, accounts: savedAccounts })
})

const start = async () => {
  await client.connect()
  await initializeDatabase()
  app.listen(port, () => {
    console.log(`EduDev API listening on http://localhost:${port}`)
  })
}

start().catch((error: unknown) => {
  console.error('Unable to connect to MongoDB.', error)
  process.exit(1)
})