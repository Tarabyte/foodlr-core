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
    contentToken = 'pornopuper'
    captionToken = 'abrakababrazavr'
    beforeEach (done) ->
      data =
        caption: "Test recipe #{captionToken} #{Math.random()}"
        content: "#{new Date} #{contentToken} content #{Math.random()}"
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
      Recipe.find where: $text: search: contentToken, (err, result) ->
        if err
          false.should.be.ok
        else
          result.length.should.be.equal 1
          result[0].id.toString().should.be.equal recipe.id.toString()

        done()

    it 'should be searchable by caption', (done) ->
      Recipe.find where: $text: search: captionToken, (err, result) ->
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

  describe 'Imageable', ->
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

    describe 'Sync files on save', ->
      recipe = null
      name = null
      before (done) ->
        data =
          caption: "Test recipe #{Date.now()}"
          content: "Test recipe content #{Math.random()}"
          ingredients: [{}]
          calories: 100

        Recipe.upsert data, (err, instance) ->
          if err
            console.log 'Error creating a recipe %s', err.message
            done()
          else
            recipe = instance
            recipe.getContainer (err, container) ->
              if err
                console.log 'Error on getting container %s', err.message
                done()
              else
                name = container.name
                stream = app.models.container
                  .uploadStream(name, 'test01.txt')

                stream.end 'message 1'

                stream = app.models.container
                  .uploadStream(name, 'test02.txt')

                stream.end 'message 2'
                done()

      after (done) ->
        if recipe
          recipe.delete (err) ->
            if err
              console.log 'Error deleting recipe %s', err.message
            else
              recipe = null
            done()

      it 'should allow to add files', (done) ->
        app.models.container.getFiles name, (err, files) ->
          if err
            false.should.be.ok
          else
            files.should.be.an 'array'
            files.length.should.be.equal 2
          done()

      it 'should remove files on save', (done) ->
        recipe.images = [{
          name: 'test01.txt'
        }]

        recipe.save (err, data) ->
          if err
            false.should.be.ok
            done()
          else
            app.models.container.getFiles name, (err, files) ->
              if err
                false.should.be.ok
              else
                files.should.be.an 'array'
                files.length.should.be.equal 1
                files[0].name.should.be.equal 'test01.txt'
              done()



  describe 'Recent', ->
    it 'should be a function', ->
      Recipe.recent.should.be.a 'function'


    it 'should return sorted array', (done) ->
      Recipe.recent null, (err, data) ->
        if err
          false.should.be.ok
        else
          data.should.be.defined
          data.length.should.be.equal 5
          data.filter (_, i) -> i > 0
            .forEach (item, i) ->
              item.createdAt.valueOf().should.be.lte data[i].createdAt.valueOf()
        done()

    it 'should allow to overide settings', (done) ->
      Recipe.recent limit: 10, (err, data) ->
        if err
          false.should.be.ok
        else
          data.should.be.defined
          data.length.should.be.equal 10

        done()

  describe 'Lucky', ->
    it 'should be a fun', ->
      Recipe.lucky.should.be.a 'function'

    it 'should return random recipe', (done) ->
      Recipe.lucky (err, recipe) ->
        if err
          done err
        else
          recipe.should.be.ok
          done()
