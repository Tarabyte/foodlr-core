module.exports = function(app, next) {
  var Recipe = app.models.Recipe,
      ds = Recipe.dataSource;

  ds.connector.autoupdate(Recipe.definition.name, next);

};
