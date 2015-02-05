var paginate = require('../core/paginate.js');
var auditable = require('../core/auditable.js');
var imageable = require('../core/imageable.js');
var recent = require('../core/recent.js');

module.exports = function(Recipe) {
  paginate(Recipe); //Apply pagination
  auditable(Recipe); //Make auditable
  imageable(Recipe, {prefix: 'recipe_'}); //Support image storage
  recent(Recipe); //add remote #recent method
};
