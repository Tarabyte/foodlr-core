{app} = require './_bootstrap.coffee'

{Rubric} = app.models

describe 'Rubric', ->
  it 'should be defined', ->
    app.models.should.have.property 'Rubric'

  it 'should be active by defaut', ->
    new Rubric()
      .active.should.be.equal true

  it 'should have order property', ->
    new Rubric(order: 10)
      .should.have.property 'order'
