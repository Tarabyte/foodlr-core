{app, should} = require './_bootstrap.coffee'

{Recipe} = app.models

describe 'Recipies', ->
  it 'should be defined', ->
    app.models.should.have.property 'Recipe'

  it 'should be active by default', ->
    new Recipe()
      .active.should.be.equal true

  describe 'Full text searching', ->
    recipe = null
    beforeEach (done) ->
      data =
        caption: "Test recipe #{Math.random()}"
        content: "#{new Date} content #{Math.random()}"
        calories: 100
        ingredients: [{}]

      Recipe.create data, (err, item) ->
        if err
          console.log 'Error on creating recipe %s', err.message
        else
          recipe = item
        done()

    afterEach (done) ->
      if recipe
        recipe.remove (err) ->
          if err
            console.log 'Error on deleting recipe %s', err.message
          done()
      else
        done()

    it 'should be created', ->
      recipe.should.be.define

    it 'should be searchable by content', (done) ->
      Recipe.find where: $text: search: recipe.content[2..25], (err, result) ->
        if err
          false.should.be.ok
        else
          result.length.should.be.equal 1
          result[0].id.toString().should.be.equal recipe.id.toString()

        done()

    it 'should be searchable by caption', (done) ->
      Recipe.find where: $text: search: recipe.caption, (err, result) ->
        if err
          false.should.be.ok
        else
          result.length.should.be.equal 1
          result[0].id.toString().should.be.equal recipe.id.toString()

        done()


