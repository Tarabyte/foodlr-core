{app} = require './_bootstrap.coffee'

describe 'Cuisine', ->
  Cuisine = null
  before ->
    {Cuisine} = app.models

  it 'should be defined', ->
    Cuisine.should.be.a 'function'

  it 'should be active', ->
    new Cuisine()
      .active.should.be.true

  describe 'popularity', ->
    it 'should have popular method', ->
      Cuisine.should.have.property 'popular'
        .that.is.a 'function'

  describe 'lucky', ->
    it 'should be a function', ->
      Cuisine.should.have.property 'lucky'
        .that.is.a 'function'
    

    