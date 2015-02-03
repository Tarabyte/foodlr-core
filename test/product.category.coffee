{app} = require './_bootstrap.coffee'

{ProductCategory} = app.models

describe 'Product Category', ->
  it 'should be defined', ->
    ProductCategory.should.be.defined
