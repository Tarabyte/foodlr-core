{should, app} = require './_bootstrap.coffee'

describe 'Test', ->
  it 'should be ok', ->
    true.should.be

  it 'should exists', ->
    should.exist.should.be.a 'function'
    should.not.exist undefined

  it 'should load app', ->
    app.should.be.defined
