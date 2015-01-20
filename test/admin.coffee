{app} = require './_bootstrap.coffee'

describe 'Default admin', ->
  it 'should have user collection', ->
    app.models.User.should.be.defined

  it 'should have admin user', (done) ->
    app.models.User.find where: username: 'admin', (err, user) ->
      user.should.be.ok
      user.length.should.be.equal 1
      user[0].username.should.be.equal 'admin'
      done()
