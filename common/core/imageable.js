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

  function getContainers() {
    return Model.app.models.container;
  }

  /**
   * Create container for current instance
   */
  Model.prototype.createContainer = function(next) {
    var container = getContainerName(this);

    getContainers().createContainer({name: container}, function(err, container){
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
    var container = getContainerName(this);

    getContainers().getContainer(container, next);
  };

  /**
   * Remove container
   */
  Model.prototype.dropContainer = function(next) {
    var container = getContainerName(this);

    getContainers().destroyContainer(container, next);
  };

  /**
   * Monitor lifecycle events to create|delete containers
   * TODO Callback hell oh no!!!
   */
  Model.observe('after save', function(ctx, next) {
    var instance = ctx.instance;
    if(!instance) {
      next();
    }
    else {
      instance.getContainer(function(err, container){
        var folder, actualFiles;
        if(err) {
          instance.createContainer(next);
        }
        else {
          folder = container.name;
          actualFiles = (instance.images || []).reduce(function(acc, file){
            acc[file.name] = 1;
            return acc;
          }, {});
          getContainers().getFiles(folder, function(err, files) {
            if(!err && files && files.length) {
              files
              .map(function(file){
                return file.name;
              })
              .forEach(function(file){
                if(!actualFiles[file]) {
                  getContainers().removeFile(folder, file);
                }
              });
            }

            next();
          });
        }
      });
    }
  });

  Model.observe('after delete', function(ctx, next) {
    var container;

    if(!ctx.where.id) {
      console.log('Duh, unable to delete multiple containers', ctx.where);
      next();
    }
    else {
      container = getContainerName(ctx.where); //expecting ids
      getContainers().destroyContainer(container, function() {
        next();
      });
    }

  });
};
