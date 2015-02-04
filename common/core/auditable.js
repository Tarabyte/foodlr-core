/**
 * Add auditable properties to the model
 * * createdAt
 * * modifiedAt
 */

module.exports = function(Model) {
  Model.defineProperty('createdAt', {type: 'date'});
  Model.defineProperty('lastModifiedAt', {type: 'date'});

  Model.observe('before save', function(ctx, next) {
    var instance, timestamp = new Date();

    instance = ctx.instance || ctx.data;

    if(!instance.createdAt) { //old instances or creating
        instance.createdAt = timestamp;
    }

    instance.lastModifiedAt = timestamp;

    next();
  });
};
