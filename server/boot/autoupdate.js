var async = require('async');
/**
 * Update indexes for fulltext search.
 */
module.exports = function(app, next) {
  var searchable = app.models()
  .filter(function(model) {
    return !!model.definition.indexes().fulltext;
  });

  async.each(searchable, function(model, cb) {
    var name = model.definition.name;

    console.log('Updating indexes for %s.', name);

    model.dataSource.autoupdate(name, cb);
  }, next);

};
