var auditable = require('../core/auditable');
var recent = require('../core/recent');
var imageable = require('../core/imageable');
var paginate = require('../core/paginate');

module.exports = function(Product) {
  auditable(Product);
  recent(Product);
  imageable(Product, {
    prefix: 'product_'
  });
  paginate(Product);

};
