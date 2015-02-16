/**
 * Add swap method to orderable models
 */

var async = require('async');

module.exports = function(app) {
  var models = app.models();

  models.forEach(function(model) {
    var name = model.definition.name,
        order = model.definition.properties.order;

    if(order && order.type === Number) {
      console.log('Adding reorder methods to %s.', name);
      /**
       * Swaps two models with ids.
       */
      model.swap = function(a, b, next) {
        model.find({where: {id: {inq: [a, b]}}}, function(err, result) {
          var tmp;
          if(err) {
            next(err);
          }
          else {
            if(result.length !== 2) {
              next({
                name: 'Error',
                code: 404,
                statusCode: 404,
                message: 'Unable to swap models with ids: ' + a + ' ' + b
              });
            }
            else {
              a = result[0];
              b = result[1];
              tmp = a.order;
              a.order = b.order;
              b.order = tmp;
              async.each(result, function(item, cb) {
                item.save(cb);
              }, function(err) {
                if(err) {
                  console.log('Unable to save data %s', err.message);
                }
                next(err, !err);
              });
            }
          }
        });
      };

      /**
       * Remoting
       */
      model.remoteMethod('swap', {
        http: {
          verb: 'post',
          path: '/swap'
        },
        accepts: [
          {arg: 'a', type: 'string', required: true, http: {source: 'form'}},
          {arg: 'b', type: 'string', required: true, http: {source: 'form'}}
        ],
        returns: {
          type: 'boolean', root: true
        }
      });
    }
  });
};
