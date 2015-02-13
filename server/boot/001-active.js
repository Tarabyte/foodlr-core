/**
 * Add custom scopes to models that have active property.
 * * active - list all active models
 * * archive - list all archive models
 */
module.exports = function(app) {
  var models = app.models();

  models.forEach(function(model) {
    var name = model.definition.name,
        active = model.definition.properties.active;


    if(active && active.type === Boolean) {
      console.log('Adding active/archive methods to %s.', name);

      if(!model.archive) {
        model.archive = function(next) {
          model.find({where: {active: false}}, next);
        };

        model.remoteMethod('archive', {
          http: {
            verb: 'get'
          },
          returns: {
            type: 'array', root: true
          }
        });

        model.active = function(next) {
          model.find({where: {active: true}}, next);
        };

        model.remoteMethod('active', {
          http: {
            verb: 'get'
          },
          returns: {
            type: 'array', root: true
          }
        });

        model.toggle = function(id, next) {
          model.findById(id, function(err, instance) {
            if(err) {
              next(err);
            }
            else if(!instance) {
              next({
                name: 'Error',
                status: 404,
                statusCode: 404,
                message: 'Unable to find model with id ' + id
              });
            }
            else {
              instance.active = !instance.active;
              instance.save(function(err, saved) {
                if(err) {
                  next(err);
                }
                else {
                  next(err, saved.active);
                }
              });
            }
          });
        };

        model.remoteMethod('toggle', {
          http: {
            path: '/:id/toggle',
            verb: 'post'
          },
          accepts: [
            {arg: 'id', type: 'string', required: true, http: {source: 'path'}}
          ],
          returns: {
            type: 'boolean', root: true
          }
        });
      }
    }
  });
};
