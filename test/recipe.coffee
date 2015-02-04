{app, should} = require './_bootstrap.coffee'

{Recipe} = app.models

_ = require 'lodash'

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

    it 'should be created', (done) ->
      recipe.should.be.define
      done()

    it 'should be searchable by content', (done) ->
      Recipe.find where: $text: search: recipe.content[2..], (err, result) ->
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

  describe 'Auditable', ->
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

    it 'should be defined', ->
      recipe.should.be.defined

    it 'should have createdAt field', ->
      recipe.createdAt.should.be.a 'Date'

    it 'should have lastModifiedAt field', (done) ->
      recipe.lastModifiedAt.should.be.a 'Date'

      recipe.lastModifiedAt.valueOf().should.be.equal recipe.createdAt.valueOf()
      done()


    it 'should update lastModifiedAt field', (done) ->
      recipe.caption = 'Something else'
      modified = recipe.lastModifiedAt.valueOf()
      check = ->
        recipe.save (err, data) ->
          if err
            false.should.be.ok
          else
            data.lastModifiedAt.valueOf().should.be.gt modified

          done()

      _.delay check, 10

  describe.only 'Imageable', ->
    it 'should have images property', ->
      definition = Recipe.definition.properties.images
      definition.should.be.defined
      definition.type.should.be.an 'array'
      definition.type[0].should.be.equal Object

    describe 'Container for images', ->
      recipe = null
      before (done) ->
        data =
          caption: "Test recipe #{Date.now()}"
          content: "Test recipe content #{Math.random()}"
          ingredients: [{}]
          calories: 100

        Recipe.upsert data, (err, instance) ->
          if err
            console.log 'Error creating a recipe %s', err.message
          else
            recipe = instance

          done()

      after (done) ->
        if recipe
          recipe.delete (err) ->
            if err
              console.log 'Error deleting recipe %s', err.message
            else
              recipe = null
            done()

      it 'should be defined', ->
        recipe.should.be.defined


      it 'should have a container', (done) ->
        recipe.getContainer (err, container) ->
          if err
            console.log 'Error on getting container %s', err.message
            false.should.be.ok
          else
            container.should.be.defined

          done()




