/**
 * Creates readonly role and assign it to readonly user
 */
module.exports = function(app, next) {
  app.models.Role.findOrCreate({
    name: 'readonly'
  }, function(err, role) {
    if(err) {
      console.log('Unable to find role Readonly %s.', err.message);
      next();
    }
    else{
      app.models.User.findOne({
        where: {
          username: 'readonly'
        }
      }, function(err, user) {
        if(err) {
          console.log('Unable to find readonly user %s.', err.message);
          next();
        }
        else if(!user) {
          console.log('Unable to find user.');
          next();
        }
        else {
          role.principals.destroyAll(function(err) {
            if(err) {
              console.log('Unable to destroy all principals %s.', err.message);
              next();
            }
            else {
              role.principals.create({
                principalId: user.getId(),
                principalType: app.models.RoleMapping.USER
              }, function(err) {
                if(err) {
                  console.log('Unable to create role mapping %s.', err.message);
                }
                next();
              });
            }
          });
        }
      });
    }
  });
};
