{app, should} = require './_bootstrap.coffee'

describe.only 'Readonly user', ->
  readonlyUser = null
  it 'should be defined', (done) ->
    app.models.User.findOne where: username: 'readonly', (err, user) ->
      should.equal err, null
      should.exist user
      user.should.be.defined
      user.username.should.equal 'readonly'
      readonlyUser = user
      done()

  describe 'Readonly role', ->
    role = null
    beforeEach (next) ->
      app.models.Role.findOne where: name: 'readonly', (err, data) ->
        unless err
          role = data
        next()

    it 'should be defined', ->
      should.exist role

    it 'should have name "readonly"', ->
      role.name.should.equal 'readonly'

    it 'should be assigned to readonly user', (next) ->
      condition = {principalId: readonlyUser.getId(), roleId: role.getId()}

      app.models.RoleMapping.findOne condition, (err, result) ->
        should.equal err, null

        result.should.be.ok

        next()



