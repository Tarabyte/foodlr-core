var paginate = require('../core/paginate.js');
var auditable = require('../core/auditable.js');
var imageable = require('../core/imageable.js');
var recent = require('../core/recent.js');
var lucky = require('../core/random.js');

module.exports = function(Recipe) {
  paginate(Recipe); //Apply pagination
  auditable(Recipe); //Make auditable
  imageable(Recipe, {prefix: 'recipe_'}); //Support image storage
  recent(Recipe); //add remote #recent method
  lucky(Recipe, 'lucky'); // add Recipe.lucky method.

  // recipe of the day
  Recipe.todays = function(next) {
    Recipe.findOne({
      order: 'recipeOfTheDay DESC',
      where: {
        recipeOfTheDay: {
          lte: new Date()
        }
      }
    }, next)
  };

  Recipe.remoteMethod('todays', {
    http: {
      verb: 'get'
    },
    returns: {
      type: 'object',
      root: true
    }
  });

  Recipe.makeTodaysRecipe = function(id, next) {    
    Recipe
      .findById(id)
      .then(function(recipe){
        recipe.recipeOfTheDay = new Date();

        return recipe.save()
      })
      .then(
        function(item) {
          next(undefined, item.recipeOfTheDay);
        },
        next
      );
  };

  Recipe.remoteMethod('makeTodaysRecipe', {
    http: {
      path: '/makeTodaysRecipe/:id'
    },
    accepts: [
      {
        arg: 'id',
        type: 'string',
        required: true,
        http: {
          source: 'path'
        }
      }
    ],
    returns: {
      type: 'date', root: true
    }
  })
};
