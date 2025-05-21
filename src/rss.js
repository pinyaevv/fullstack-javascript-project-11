import axios from 'axios'
import logger from './logger.js'

export const fetchRSS = (url) => {
  const proxy = new URL('https://allorigins.hexlet.app/get')
  proxy.searchParams.set('url', url)
  proxy.searchParams.set('disableCache', 'true')
  const proxyUrl = proxy.toString()

  return axios.get(proxyUrl, { timeout: 5000 })
    .then((response) => {
      if (!response.data.contents) {
        throw new Error('InvalidRSS')
      }
      return response.data.contents
    })
    .catch((error) => {
      const errorType = (error.code === 'ECONNABORTED'
          || error.message.includes('network')
          || error.isAxiosError)
          ? 'network'
          : 'invalidRss'

      throw Error(errorType)
    })
}

export const parserRSS = (data) => {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(data, 'application/xml')

    if (doc.querySelector('parsererror')) {
      throw new Error('InvalidRSS')
    }

    const feed = {
      title: doc.querySelector('channel > title')?.textContent || 'No title',
      description: doc.querySelector('channel > description')?.textContent || 'No description',
    }

    const posts = Array.from(doc.querySelectorAll('item')).map(item => ({
      title: item.querySelector('title')?.textContent || 'No title',
      link: item.querySelector('link')?.textContent?.trim() || '#',
      description: item.querySelector('description')?.textContent || '',
    }))

    return { feed, posts }
  } 
  catch (error) {
    logger.error('Parse error:', error)
    throw new Error(error.message === 'InvalidRSS' ? 'InvalidRSS' : 'ParseError')
  }
}
