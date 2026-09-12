// Версия сайта меняется при каждом деплое: 20260912-001 — дата и номер
// выкладки за этот день. Дата берётся местная, номер сбрасывается в 001,
// как только наступил новый день.
import { readFileSync, writeFileSync } from 'node:fs'

const file = new URL('../version.json', import.meta.url)
const now = new Date()
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('')

const previous = JSON.parse(readFileSync(file, 'utf8')).version ?? ''
const [day, seq] = previous.split('-')
const next = day === today ? String(Number(seq) + 1).padStart(3, '0') : '001'
const version = `${today}-${next}`

writeFileSync(file, JSON.stringify({ version }, null, 2) + '\n')
console.log(version)
