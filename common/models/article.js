var paginate = require('../core/paginate.js');
var auditable = require('../core/auditable.js');
var imageable = require('../core/imageable.js');
var recent = require('../core/recent.js');
var rubric = require('../core/rubricatable.js');

module.exports = function(Article) {
  paginate(Article); //Apply pagination
  auditable(Article); //Make auditable
  imageable(Article, {prefix: 'news_'}); //Support image storage
  recent(Article); //add remote #recent method
  rubric(Article); //filter by rubric keyword
};
