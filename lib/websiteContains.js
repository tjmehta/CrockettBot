import baseErrorModule from 'baseerr'
import https from 'https'
import miss from 'mississippi'

const BaseError = baseErrorModule.default

export default async function websiteContains(url, regexp) {
  const res = await new Promise((resolve, reject) => {
    const req = https.request('https://www.crockettdoodles.com/available-puppies', {
      headers: {
        "user-agent": "curl/7.64.1",
        "accept": "*/*"
      }
    }, resolve)
    req.on('error', (err) => {
      reject(BaseError.wrap(err, 'request error'))
    })
    req.end()
  })

  // check status code
  if (res.statusCode !== 200) throw new BaseError('unexpected status code', { status: res.statusCode })

  // check body
  return new Promise((resolve, reject) => {
    let body = ''
    res.on('error', (err) => {
      reject(BaseError(err, 'res error'))
    })
    res.on('data', (chunk) => {
      body = body.slice(0 - regexp.toString() * 4)
      body += chunk.toString()
      const found = regexp.test(body)
      if (found) resolve(found)
    })
    res.on('end', () => {
      resolve(false)
    })
  })
}
