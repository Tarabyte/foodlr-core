{app} = require './_bootstrap.coffee'

{Nutrient} = app.models

describe 'Nutrient', ->
  it 'should be defined', ->
    app.models.should.have.property 'Nutrient'

  it 'should be active by defaut', ->
    new Nutrient()
      .active.should.be.equal true

  it 'should have order property', ->
    new Nutrient(order: 10)
      .should.have.property 'order'
