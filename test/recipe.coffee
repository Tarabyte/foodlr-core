{app, should} = require './_bootstrap.coffee'

{Recipe} = app.models

describe 'Recipies', ->
  it 'should be defined', ->
    app.models.should.have.property 'Recipe'

  it 'should be active by default', ->
    new Recipe()
      .active.should.be.equal true

