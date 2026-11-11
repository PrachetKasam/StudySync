require('temporal-polyfill/full/global');
const postgresModule = require('@prisma/orm-postgres/runtime');
const postgres = postgresModule.default || postgresModule;
const { readFileSync } = require('node:fs');
const path = require('node:path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

let contractJson;
try {
  contractJson = require('../prisma/contract.json');
} catch {
  const contractPath = path.join(__dirname, '../prisma/contract.json');
  contractJson = JSON.parse(readFileSync(contractPath, 'utf8'));
}

const db = postgres({
  contractJson,
  url: process.env.DATABASE_URL,
});

// Support standard CommonJS, named export, and ESM default interop
module.exports = db;
module.exports.default = db;
module.exports.db = db;
