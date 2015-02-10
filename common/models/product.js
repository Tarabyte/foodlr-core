var auditable = require('../core/auditable');
var recent = require('../core/recent');
var imageable = require('../core/imageable');

module.exports = function(Product) {
  auditable(Product);
  recent(Product);
  imageable(Product, {
    prefix: 'product_'
  });
};
