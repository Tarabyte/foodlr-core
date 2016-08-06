{app} = require './_bootstrap.coffee'

describe.only 'Cuisine', ->
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
    

    