{app} = require './_bootstrap.coffee'

{Product} = app.models

describe 'Product', ->
  it 'should be defined', ->
    app.models.should.have.property 'Product'

  it 'should be active by defaut', ->
    new Product()
      .active.should.be.equal true

  it 'should have order property', ->
    new Product(order: 10)
      .should.have.property 'order'
