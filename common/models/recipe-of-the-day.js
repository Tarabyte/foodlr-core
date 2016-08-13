module.exports = function(RecipeOfTheDay) {
  // Validations pysh-pysh
  RecipeOfTheDay.validatesPresenceOf('recipeId');

  RecipeOfTheDay.forDate = function(date) {
    console.log(date, typeof date);

    return RecipeOfTheDay.findOne({
      order: "date DESC",
      where: {
        date: {
          lte: date
        }
      },
      include: 'recipeOfTheDay'
    })
    .then(function(found) {
      return found ? found.recipeOfTheDay() : found;
    });
  };

  // Get previous recipes of the day method
  RecipeOfTheDay.recent = function(days, next) {
    RecipeOfTheDay
      .forDate(new Date(new Date() - days*24*60*60*1000))
      .then(
        function(found) {
          next(undefined, found);
        },
        next
      );
  };

  RecipeOfTheDay.remoteMethod('recent', {
    http: {
      verb: 'get',
      path: '/recent/:days'
    },
    accepts: [
      {
        arg: 'days',
        type: 'number',
        http: function(ctx) {
          return ctx.req.params.days;
        }
      }
    ],
    returns: {
      type: 'object',
      root: true
    }
  });

  // Get todays recipe method
  RecipeOfTheDay.todays = RecipeOfTheDay.recent.bind(RecipeOfTheDay, 0);

  RecipeOfTheDay.remoteMethod('todays', {
    http: {
      verb: 'get'
    },
    returns: {
      type: 'object',
      root: true
    }
  });

  return RecipeOfTheDay;
};
