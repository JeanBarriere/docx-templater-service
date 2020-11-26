const functions = require('firebase-functions')
const { generateDoc } = require('./docx')
const { getData } = require('./getData')

exports.generateDoc = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    // Return a "method not allowed" error
    return res.status(405).end();
  }

  const { files, body } = await getData(req)

  if (!files.doc) {
    res.status(422).send('file not found')
  }

  const file = files.doc
  if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    res.status(422).send('invalid file')
  } else if (!('data' in body)) {
    res.status(422).send('no template sent')
  }
  const { data: strData } = body
  let data
  try {
    data = JSON.parse(strData)
  } catch (e) {
    res.status(422).send('template is not a valid json object')
  }

  const doc = generateDoc(file.buffer, data)
  res.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document').send(doc)
})
