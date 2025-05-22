import { DOMParser } from 'xmldom'
import logger from './logger.js'
import fetchFile from './utils/fetchFile.js'
import proxyUrl from './utils/proxy.js'

export const fetchRSS = (url) => {
  const fullUrl = proxyUrl(url)

  return fetchFile(fullUrl)
    .then((response) => {
      if (!response.contents) {
        const error = new Error('InvalidResponse')
        error.name = 'InvalidResponse'
        throw error
      }
      return response.contents
    })
    .catch((error) => {
      const errorType = (error.code === 'ECONNABORTED'
        || error.message.includes('network')
        || error.isAxiosError)
        ? 'NetworkError'
        : 'InvalidRSS'

      const err = new Error(errorType)
      err.name = errorType
      throw err
    })
}

export const parserRSS = (data) => {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(data, 'application/xml')

    const parseErrors = doc.getElementsByTagName('parsererror')
    if (parseErrors.length > 0) {
      const error = new Error('InvalidRSS')
      error.name = 'InvalidRSS'
      throw error
    }

    const getText = (parent, tag) => {
      const el = parent.getElementsByTagName(tag)[0]
      return el?.textContent || ''
    }

    const channel = doc.getElementsByTagName('channel')[0]

    const feed = {
      title: getText(channel, 'title') || 'No title',
      description: getText(channel, 'description') || 'No description',
    }

    const items = Array.from(doc.getElementsByTagName('item'))

    const posts = items.map((item) => ({
      title: getText(item, 'title') || 'No title',
      link: getText(item, 'link')?.trim() || '#',
      description: getText(item, 'description') || '',
    }))

    return { feed, posts }
  }
  catch (error) {
    logger.error('Parse error:', error)

    if (error.name === 'InvalidRSS') {
      throw error
    }

    const parseError = new Error('InvalidRSS')
    parseError.name = 'InvalidRSS'
    throw parseError
  }
}
