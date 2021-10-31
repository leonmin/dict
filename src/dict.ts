import fetch from 'node-fetch'
import cryptojs from 'crypto-js'
import { format, truncate } from './utils.js'

const HOST = 'https://openapi.youdao.com/api'
const { enc, SHA256 } = cryptojs

export const query = async (q: string) => {
  const appKey = '01b850be59936bf5'
  const appSecret = 'LgfzzW0RdLlHjXCApVDpmRZTsAY7mGea'
  const salt = Date.now().toString()
  const curtime = Math.round(Date.now() / 1000).toString()
  const str = appKey + truncate(q) + salt + curtime + appSecret
  const sign = SHA256(str).toString(enc.Hex)
  const form = new URLSearchParams()
  form.append('q', q)
  form.append('from', 'en')
  form.append('to', 'zh-CHS')
  form.append('appKey', appKey)
  form.append('salt', salt)
  form.append('sign', sign)
  form.append('signType', 'v3')
  form.append('curtime', curtime)
  const x = await fetch(HOST, {
    method: 'POST',
    body: form,
  })
  const json = await x.json()
  return format(json)
}
