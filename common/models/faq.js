var paginate = require('../core/paginate');
var auditable = require('../core/auditable');
var recent = require('../core/recent');

module.exports = function(Faq) {
  paginate(Faq);
  auditable(Faq);
  recent(Faq);
};
