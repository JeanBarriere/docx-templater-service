const Busboy = require('busboy')

async function getData (req) {
  return new Promise((resolve, reject) => {
    const busboy = new Busboy({ headers: req.headers })

    const body = {}
    const files = {}

    busboy.on('field', (fieldname, val) => {
      console.log(`Processed field ${fieldname}: ${val}.`)
      body[fieldname] = val
    })

    const fileBuffers = []


    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      console.log(`Processed file ${filename}`)

      const promise = new Promise((res, rej) => {
        const fileBuffer = [];
        file.on('data', function (d) { fileBuffer.push(d) })
        file.on('end', function () {
          files[fieldname] = { mimetype, buffer: Buffer.concat(fileBuffer) }
          res()
        })
        file.on('error', rej)
      })

      fileBuffers.push(promise)
    })

    busboy.on('finish', async () => {
      await Promise.all(fileBuffers).catch(reject)
      resolve({ body, files })
    })
    busboy.end(req.rawBody)
  })
}

exports.getData = getData
