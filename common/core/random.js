module.exports = function(model, method) {
  method = method || 'random';

  model[method] = function(next) {
    model.count(function(err, count) {
      if(err) {
        next(err);
      }
      else {
        model.findOne({
          take: 1,
          skip: Math.floor(Math.random()*count)
        }, next);
      }
    });
  };

  model.remoteMethod(method, {
    http: {
      verb: 'get'
    },
    returns: {
      type: 'object',
      root: true
    }
  });

};
