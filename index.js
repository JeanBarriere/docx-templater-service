const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const multer = require('multer')
const { generateDoc } = require('./docx')
const upload = multer()

const app = express()

app.use(helmet())
app.use(cors())

app.post('/', upload.single('doc'), function (req, res) {
  const file = req.file
  if (!file || file.mimetype !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    res.status(422).send('invalid file or file not found')
  } else if (!('data' in req.body)) {
    res.status(422).send('no template sent')
  }
  const { data: strData } = req.body
  let data
  try {
    data = JSON.parse(strData)
  } catch (e) {
    res.status(422).send('template is not a valid json object')
  }

  const doc = generateDoc(file.buffer, data)
  res.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document').send(doc)
})

app.listen(3000, () => {
  console.log(' server ready on port 3000')
})
