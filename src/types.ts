export type DictActionType = 'list' | 'query' | 'config' | 'clear' | 'reset'
export interface DictConfig {
  enabled: 1 | 2
  max: number
}
export interface DictItem {
  word: string
  explains: []
  phonetic: string
  translation: []
  web: DictMaps[]
  wfs: DictMaps[]
  updated: number
  count: number
}
export interface DictMaps {
  name: string
  value: string | string[]
}
export interface DictDB {
  data: Dict
}
export interface Dict {
  list: DictItem[]
  config: DictConfig
}
export interface DictResult {}
export interface DictOptions {
  key: string
  value: number | string
}
