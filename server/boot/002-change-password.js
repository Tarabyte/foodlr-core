module.exports = function(app, next) {
  var User = app.models.User, ACL = app.models.ACL;

  console.log('Adding User#changePassword method');

  if(!User) {
    console.log('User model is not available');
    next();
    return;
  }

  if(!ACL) {
    console.log('ACL model is not available');
    next();
    return;
  }

  function validate(data) {
    return data &&
      data.password &&
      data.newPassword &&
      (data.newPassword === data.newPasswordConfirm);
  }

  User.changePassword = function(id, data, next) {
    if(!validate(data)) {
      next({
        name: 'Error',
        status: 408,
        statusCode: 408,
        message: 'Bad request'
      });
    }
    else {
      User.findById(id, function(err, user) {
        if(err) {
          next(err);
        }
        else {
          if(!user) {
            next({
              name: 'Error',
              status: 404,
              statusCode: 404,
              message: 'User not found'
            });
          }
          else {
            user.hasPassword(data.password, function(err, hasPassword) {
              if(err) {
                next(err);
              }
              else {
                if(!hasPassword) {
                  next({
                    name: 'Error',
                    status: 401,
                    statusCode: 401,
                    message: 'Incorrect login or password'
                  });
                }
                else {
                  user.password = data.newPassword;
                  user.save(function(err) {
                    if(err) {
                      next(err);
                    }
                    else {
                      next(null, true);
                    }
                  });
                }
              }
            });
          }
        }
      });
    }
  };

  User.remoteMethod('changePassword', {
    http: {
      path: '/:id/changePassword',
      verb: 'post'
    },
    accepts: [
      {arg: 'id', type: 'string', required: true, http: {source: 'path'}},
      {arg: 'data', type: 'object', required: true, http: {source: 'form'}}
    ],
    returns: {
      type: 'boolean', root: true
    }
  });

  ACL.create({
    model: 'User',
    property: 'changePassword',
    accessType: ACL.EXECUTE,
    permission: ACL.ALLOW,
    principalType: ACL.ROLE,
    principalId: '$owner'

  }, function(err) {
    if(err) {
      console.log('Unable to create permission %s', err.message);
    }

    next();
  });
};
