/**
 * Add auditable properties to the model
 * * createdAt
 * * modifiedAt
 */

function before(pre, run) {
  if(!run) {
    return function(next, instance) {
      pre(instance);
      next();
    };
  }
  return function(next, instance) {
    pre(instance);
    run(next, instance);
  };
}

module.exports = function(Model) {
  Model.defineProperty('createdAt', {type: 'date'});
  Model.defineProperty('lastModifiedAt', {type: 'date'});

  Model.beforeCreate  = before(function(instance) {
    instance.createdAt = instance.lastModifiedAt = new Date();
  }, Model.beforeCreate);

  Model.beforeSave = before(function(instance) {
    if(instance.createdAt == null) {
      instance.createdAt = new Date(); //old instances.
    }
    instance.lastModifiedAt = new Date();
  }, Model.beforeSave);
};
