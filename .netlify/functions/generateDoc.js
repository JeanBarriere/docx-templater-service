// const parser = require('lambda-multipart-parser');
const { generateDoc } = require('../../docx')
const { getData } = require('../../firebase/functions/getData')

exports.handler = async (event, context) => {
  // Only allow POST

  console.log(context)

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const { files, body } = await getData(event)

  if (!files.doc) {
    return {
      statusCode: 422,
      body: 'file not found'
    }
  }

  const file = files.doc
  if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return {
      statusCode: 422,
      body: 'invalid file'
    }
  } else if (!('data' in body)) {
    return {
      statusCode: 422,
      body: 'no template sent'
    }
  }
  const { data: strData } = body
  let data
  try {
    data = JSON.parse(strData)
  } catch (e) {
    return {
      statusCode: 422,
      body: 'template is not a valid json object'
    }
  }

  const doc = await generateDoc(file.buffer, data)
  // res.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document').send(doc)

  return {
    statusCode: 200,
    body: 'done'
  }
}
/*
  const result = await parser.parse(event)

  let file
  for (let f of result.files) {
    if (f.fieldname === 'doc') {
      file = f
      break
    }
  }

  if (!file || file.contentType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return {
      statusCode: 422,
      body: 'invalid file or file not found'
    }
  } else if (!('data' in result)) {
    return {
      statusCode: 422,
      body: 'no template sent'
    }
  }

  const { data: strData } = result
  let data
  try {
    data = JSON.parse(strData)
  } catch (e) {
    return {
      statusCode: 422,
      body: 'template is not a valid json object'
    }
  }

  const doc = generateDoc(file.content, data)
  // res.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document').send(doc)


  return {
    statusCode: 200,
    body: file.content
  }
}

*/