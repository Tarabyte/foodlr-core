function isSameDay(date) {
  return {
    between: [
      new Date(date).setHours(0, 0, 0, 0),
      new Date(date).setHours(23, 59, 59, 999)
    ]
  };
}


function applyValidations(RecipeOfTheDay) {
  RecipeOfTheDay.validatesPresenceOf('recipeId');
  RecipeOfTheDay.validateAsync('date', uniqueDate, {
    message: 'Recipe for the day has already been defined'
  });

  function uniqueDate(fail, done) {  
    RecipeOfTheDay.find({
      where: {
        date: isSameDay(this.date)
      },
      fields: 'id'
    }).then(
      function(found) {
        if(found.length > 0) {
          fail();
        }

        done();    
      },
      done
    );
  }
}

module.exports = function(RecipeOfTheDay) {

  // Validations pysh-pysh
  applyValidations(RecipeOfTheDay);

  RecipeOfTheDay.forDate = function(date) {
    return RecipeOfTheDay.findOne({
      where: {
        date: isSameDay(date)
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
