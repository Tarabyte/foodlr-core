{app} = require './_bootstrap.coffee'

{Category} = app.models

describe 'Categories', ->
  it 'should be defined', ->
    app.models.should.have.property 'Category'

  it 'should be active by default', ->
    new Category()
      .active.should.be.equal true
