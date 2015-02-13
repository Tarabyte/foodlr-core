/**
 * Create admin role and adds mapping.
 */

function addRole(app, role, next) {
  app.models.User.findOne({username: 'admin'}, function(err, admin) {
    if(err) {
      console.log('Unable to find admin user %s', err.message);
      next();
    }
    else if(!admin) {
      console.log('Admin doesn\'t exist.');
      next();
    }
    else {
      role.principals.destroyAll(function(err){
        if(err) {
          console.log('Unable to destroy principals %s', err.message);
          next();
        }
        else {
          role.principals.create({
            principalType: app.models.RoleMapping.USER,
            principalId: admin.getId()
          }, function(err) {
            if(err) {
              console.log('Unable to add principal %s', err.message);
            }
            next();
          });
        }
      });
    }

  });
}

module.exports = function(app, next) {
  console.log('Creating admin role.');
  app.models.Role.findOne({name: 'admin'}, function(err, role) {
    if(err) {
      console.log('Unable to fetch role %s', err.message);
      next();
    }
    else {
      if(role) {
        addRole(app, role, next);
      }
      else {
        app.models.Role.create({name: 'admin'}, function(err, role) {
          if(err) {
            console.log('Unable to create role %s', err.message);
            next();
          }
          else {
            addRole(app, role, next);
          }
        });
      }
    }
  });
};
