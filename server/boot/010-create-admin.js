module.exports = function(app, next) {
  console.log('Creating default admin.');
  app.models.User.findOne({username: 'admin'}, function(err, admin){
    if(err) {
      console.log('Error on fetching admin user %s', err.message);
      next(err);
    }
    else {
      if(admin) {
        console.log('Admin user exists.');
        next();
      }
      else {
        app.models.User.create({
          username: 'admin',
          email: 'noreply@foodlr.ru',
          password: 'pkjt,exrf'
        }, function(err, user) {
          if(err) {
            console.log('Error on creating user %s.', err.message);
          }
          else {
            console.log(user);
          }
          next();
        });
      }
    }
  });

};
