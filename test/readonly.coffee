{app, should} = require './_bootstrap.coffee'


describe.only 'Readonly user', ->
  it 'should be defined', (done) ->
    app.models.User.findOne where: username: 'readonly', (err, user) ->
      should.equal err, null
      should.exist user
      user.should.be.defined
      user.username.should.equal 'readonly'
      done()
