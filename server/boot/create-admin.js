module.exports = function(app, next) {
  console.log('Creating default admin.');
  app.models.User.create({
    username: 'admin',
    email: 'noreply@foodlr.ru',
    password: 'pkjt,exrf'
  }, function(err, user) {
    if(err) {
      console.log('Error on creating user.', err);
    }
    console.log(user);
    next();
  });
};
