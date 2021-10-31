#! /usr/bin/env node
import boxen from 'boxen'
import chalk from 'chalk'
import inquirer from 'inquirer'
import yargs, { boolean } from 'yargs'
import os from 'os'
import { hideBin } from 'yargs/helpers'
import { query } from './dict.js'
import { join } from 'path'
import { JSONFile, Low } from 'lowdb'
import {
  DictActionType,
  Dict,
  DictItem,
  DictConfig,
  DictOptions,
} from './types'
import { describe, describeResult } from './utils.js'
const usage =
  '\n使用： dict [--version] [--help] [-r | --reverse] [-s | --sort] <commond> [<args>]'
const configMaps: DictConfig = {
  enabled: 1,
  max: 50,
}
const clearPromptList = [
  {
    type: 'confirm',
    name: 'clear',
    message: 'Whether to clear all dist word?',
    default: false,
  },
]
const resetPromptList = [
  {
    type: 'confirm',
    name: 'reset',
    message: 'Whether to reset config?',
    default: false,
  },
]

const dict = async (
  argv: yargs.Arguments & DictOptions,
  type: DictActionType
) => {
  const homedir = os.homedir()
  const file = join(homedir, 'dict.json')
  const adapter = new JSONFile(file)
  const db = new Low(adapter)
  let dict: DictItem
  let dicts = []
  await db.read()
  db.data = db.data || { list: [], config: configMaps }
  let { list = [] as DictItem[], config = {} as DictConfig } = db.data as Dict
  switch (type) {
    case 'query':
      if (argv._.length > 0) {
        dict = await query(argv._.join(' '))
        console.log(
          boxen(chalk.green(describeResult(dict)), { borderColor: 'green' })
        )
        if (config && config.enabled === 1) {
          let exist = false
          list.forEach((item) => {
            if (item.word === dict.word) {
              exist = true
              item.explains = dict.explains
              item.phonetic = dict.phonetic
              item.translation = dict.translation
              item.word = dict.word
              item.count += 1
              item.updated = dict.updated
              item.web = dict.web
              item.wfs = dict.wfs
            }
          })
          if (!exist) {
            if (list.length >= config.max) {
              list.sort((a, b) => b.updated - a.updated).splice(config.max - 1)
            }
            list.push(dict)
          }
          await db.write()
        }
      } else {
        if (list && list.length > 0) {
          const last = list.sort((a, b) => b.updated - a.updated)[0]
          console.log(boxen(chalk.green(describeResult(last))))
        } else {
          console.log(chalk.yellow('输入dict --help查看帮助'))
        }
      }

      break
    case 'list':
      dicts = Array.from(list, (o: DictItem) => ({
        word: o.word,
        description: describe(o).substring(0, 25),
        count: o.count,
        time: o.updated,
        date: new Date(o.updated).toLocaleDateString(),
      }))
      if (dicts.length === 0) {
        console.log(chalk.yellow('no dict data'))
        return
      }
      const { s = 'u', r = false } = argv
      const filter = ['word', 'description']
      switch (s) {
        case 'a':
          dicts = dicts.sort((a, b) => b.word.localeCompare(a.word))
          break
        case 'c':
          dicts = dicts.sort((a, b) => b.count - a.count)
          filter.push('count')
          break
        case 'u':
          dicts = dicts.sort((a, b) => b.time - a.time)
          filter.push('date')
          break
        default:
          break
      }
      if (r) {
        dicts = dicts.reverse()
      }
      console.table(dicts, filter)
      break
    case 'config':
      const { key = '', value = '' } = argv
      if (!key && !value) {
        console.log(chalk.green(JSON.stringify(config)))
      } else if (Object.keys(configMaps).includes(key)) {
        if (value) {
          if (key === 'enabled' && [1, 2].includes(Number(value))) {
            ;(db.data as Dict).config.enabled = Number(value) == 1 ? 1 : 2
            db.write()
            console.log(
              chalk.green(
                `设置是否开启本地存储1开启2关闭: ${Number(value) == 1 ? 1 : 2}`
              )
            )
          } else if (key === 'max') {
            ;(db.data as Dict).config.max = Number(value) || configMaps.max
            db.write()
            console.log(
              chalk.green(
                `设置查询列表最大数量: ${Number(value) || configMaps.max}`
              )
            )
          }
        } else {
          console.log(config[key as 'enabled' | 'max'])
        }
      } else {
        console.log(chalk.yellow('输入dict --help查看帮助'))
      }
      break
    case 'clear':
      inquirer.prompt(clearPromptList).then((answers) => {
        if (answers['clear']) {
          ;(db.data as Dict).list = []
          db.write()
          console.log(chalk.green('clear successfully'))
        }
      })
      break
    case 'reset':
      inquirer.prompt(resetPromptList).then((answers) => {
        if (answers['reset']) {
          ;(db.data as Dict).list = []
          ;(db.data as Dict).config = configMaps
          db.write()
          console.log(chalk.green('reset successfully'))
        }
      })
      break
    default:
      break
  }
}
yargs(hideBin(process.argv))
  .usage(usage)
  .command(['$0', 'last'], '获取最近一次查询', {}, (argv) => {
    dict(argv as any, 'query')
  })
  .command(
    ['config [key] [value]'],
    '获取/设置配置, max:最大存储数量 enabled:1开启2关闭',
    {},
    (argv) => {
      dict(argv as any, 'config')
    }
  )
  .command(['list'], '查询列表', {}, (argv) => {
    dict(argv as any, 'list')
  })
  .command(['clear'], '清空列表', {}, (argv) => {
    dict(argv as any, 'clear')
  })
  .command(['reset'], '清空列表,重置配置', {}, (argv) => {
    dict(argv as any, 'reset')
  })
  .option('s', {
    alias: 'sort',
    describe: '列表排序a(字母), c(查询次数)), t(最新查询时间)',
    type: 'string',
    demandOption: false,
  })
  .option('r', {
    alias: 'reverse',
    describe: '列表逆序',
    type: 'boolean',
    demandOption: false,
  })
  .locale('zh_CN')
  .parse()
