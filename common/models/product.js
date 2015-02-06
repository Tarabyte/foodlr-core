var recent = require('../core/recent');
var imageable = require('../core/imageable');

module.exports = function(Product) {
  recent(Product, {by: 'order'});
  imageable(Product, {
    prefix: 'product_'
  });
};
