require('temporal-polyfill/full/global');
const postgres = require('@prisma/orm-postgres/runtime').default
const { readFileSync } = require('node:fs')
const path = require('node:path')

require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') })
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
require('dotenv').config()

const contractPath = path.join(__dirname, '../prisma/contract.json')
const contractJson = JSON.parse(readFileSync(contractPath, 'utf8'))

const db = postgres({
  contractJson,
  url: process.env.DATABASE_URL,
})

module.exports = db
