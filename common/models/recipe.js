var paginate = require('../core/paginate.js');
var auditable = require('../core/auditable.js');

module.exports = function(Recipe) {
  paginate(Recipe); //Apply pagination
  auditable(Recipe); //Make auditable
};
