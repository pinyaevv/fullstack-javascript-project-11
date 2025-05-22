const proxyUrl = (targetUrl) => {
  const proxy = new URL('https://allorigins.hexlet.app/get')
  proxy.searchParams.set('url', targetUrl)
  proxy.searchParams.set('disableCache', 'true')
  return proxy.toString()
}

export default proxyUrl
