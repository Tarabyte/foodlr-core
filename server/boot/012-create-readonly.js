/**
 * Creates readonly user.
 */

module.exports = function(app, next) {
  app.models.User.findOne({
    where: {
      username: 'readonly'
    }
  }, function(err, user) {
    if(err) {
      console.log('Unable to fetch user %s.', err.message);
      next();
    }
    else if (user) {
      console.log('Readonly user exists.');
      next();
    }
    else {
      app.models.User.create({
        username: 'readonly',
        email: 'readonly@foodzzilla.ru',
        password: 'U98%reMK'
      }, function(err, user) {
        if(err) {
          console.log('Unable to create readonly user %s.', err.message);
        }
        else {
          console.log('Readonly user created %s.', user.id);
        }
        next();
      });
    }
  });
};
