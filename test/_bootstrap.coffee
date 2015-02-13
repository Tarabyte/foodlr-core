should = require('chai').should()
app = require('../server/server.js')
app.boot()

module.exports =
  should: should
  app: app
