/**
 * Adds image functionality to a Model
 * * defines #images property of type ["object"]
 * * creates container using id as container name
 */

var merge = require('merge'),
    defaults = {
      prefix: 'imgs_'
    };

module.exports = function(Model, options) {
  options = merge({}, defaults, options||{});
  Model.defineProperty('images', {type: ['object']});

  function getContainerName(inst) {
    return options.prefix + inst.id.toString();
  }

  /**
   * Create container for current instance
   */
  Model.prototype.createContainer = function(next) {
    var container = getContainerName(this),
        containers = Model.app.models.container;

    containers.createContainer({name: container}, function(err, container){
      if(err) {
        console.log('Unable to create container %s', err.message);
      }
      next(err, container);
    });
  };


  /**
   * #getContainer instance method
   */
  Model.prototype.getContainer = function(next) {
    var container = getContainerName(this),
        containers = Model.app.models.container;

    containers.getContainer(container, next);
  };

  /**
   * Remove container
   */
  Model.prototype.dropContainer = function(next) {
    var container = getContainerName(this),
        containers = Model.app.models.container;

    containers.destroyContainer(container, next);
  };

  /**
   * Monitor lifecycle events to create|delete containers
   */

  Model.observe('after save', function(ctx, next) {
    var instance = ctx.instance;
    if(!instance) {
      next();
    }
    else {
      instance.getContainer(function(err){
        if(err) {
          instance.createContainer(function() {
            next();
          });
        }
        else {
          next();
        }
      });
    }
  });

  Model.observe('after delete', function(ctx, next) {
    var container, containers;

    if(!ctx.where.id) {
      console.log('Duh, unable to delete multiple containers', ctx.where);
      next();
    }
    else {
      container = getContainerName(ctx.where); //expecting ids
      containers = ctx.Model.app.models.container;
      containers.destroyContainer(container, function() {
        next();
      });
    }

  });
};
