import { DictItem, DictMaps } from './types'

export const describeResult = (item: DictItem): string => {
  const { word, phonetic, translation, explains, web = [], wfs = [] } = item
  const symbol = phonetic ? ` [${phonetic}]` : ''
  let webStr,
    wfsStr,
    descStr = ''
  if (explains && explains.length > 0) {
    descStr += '\n'
    descStr += explains.join('\n')
  }
  if (word && word.includes(' ') && translation && translation.length > 0) {
    descStr += '\n'
    descStr += translation.join('\n')
  }

  if (web && web.length > 0) {
    webStr =
      '\n' +
      Array.from(web, (o: any) => `[网译] ${o.key} ${o.value.join(';')}`).join(
        '\n'
      )
  }
  if (wfs && wfs.length > 0) {
    wfsStr =
      '\n' +
      Array.from(wfs, (o: DictMaps) => `[${o.name}] ${o.value}`).join('\n')
  }
  return `${word}${symbol}${descStr}${webStr}${wfsStr}`
}

export const format = (res: any): DictItem => {
  const { translation = [], basic = {}, query = '', web = [] } = res
  const { explains = [], wfs = [] } = basic
  const item: DictItem = {
    explains: explains,
    phonetic:
      basic['us-phonetic'] || basic['uk-phonetic'] || basic['phonetic'] || '',
    translation: translation,
    word: query,
    web: web,
    updated: Date.now(),
    wfs: Array.from(wfs, (o: any) => o.wf),
    count: 1,
  }
  return item
}

export const truncate = (q: string): string => {
  const len = q.length
  if (len < 20) return q
  return q.substring(0, 10) + len + q.substring(len - 10, len)
}

export const describe = (item: DictItem) => {
  return `[${item.phonetic}] ${item.explains.join(';')}`
}
