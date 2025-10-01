const express = require('express')
const morgan = require('morgan')
const { sequelize } = require('./models')

const config = require('./config')

const app = express()
app.use(express.json()) // for parsing Content-Type: application/json
app.use(morgan('combined'))

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./src/openapi.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

require('./passport')
require('./routes')(app)

sequelize.sync({ force: false })
  .then(() => {
    app.listen(config.port, (err) => {
      if (err) {
        console.log(`Failed to start server at port ${config.port}`)
      } else {
        console.log(`Server started at port ${config.port}`)
      }
    })
  }).catch((err) => {
    console.log(`Failed to connect to PgSQL server ${err}`)
    console.log(err)
  })
