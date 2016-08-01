{app, should} = require './_bootstrap.coffee'

paginate = require '../common/core/paginate.js'

{Recipe} = app.models

describe 'Paginate Mixin', ->
  it 'should be a function', ->
    paginate.should.be.a 'function'


  it 'should throw when called w/o model', ->
    ( -> paginate()).should.throw()

  it 'should add paginate method to a model', ->
    Recipe.should.have.property 'paginate'
    Recipe.paginate.should.be.a 'function'

  describe '#paginate', ->
    count = 0
    beforeEach (next) ->
      Recipe.count (err, value) ->
        count = value
        next()

    it 'should return paginated values', (next) ->
      Recipe.paginate 2, (err, data) ->
        should.not.exist err
        data.should.be.defined
        data.data.should.be.an 'array'
        data.pages.should.be.equal Math.ceil count/2
        data.page.should.be.equal 1

        next()

    it 'should honor offset',  (next) ->
      Recipe.paginate 2, 1, (err, data) ->
        should.not.exist err
        data.should.be.defined
        data.data.should.be.an 'array'
        data.pages.should.be.equal Math.ceil count/2
        data.page.should.be.equal 2

        next()

    it 'should honor filter', (next) ->
      Recipe.find limit: 1, (err, items) ->
        items.length.should.be.equal 1
        id = items[0].id
        Recipe.paginate 10, 0, {where: id: id}, (err, items) ->
          should.not.exist err
          items.data.length.should.be.equal 1
          items.data[0].id.toString().should.be.equal id.toString()
          next()

    it 'should honor filter as 2nd argument', (next) ->
      Recipe.find limit: 1, (err, items) ->
        items.length.should.be.equal 1
        id = items[0].id
        Recipe.paginate 10, {where: id: id}, (err, items) ->
          should.not.exist err
          items.data.length.should.be.equal 1
          items.data[0].id.toString().should.be.equal id.toString()
          next()


