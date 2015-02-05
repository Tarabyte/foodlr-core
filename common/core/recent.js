/**
 * Add recent functionality to a model
 */

var merge = require('merge'),
    defaults = {
      /**
       * Top count to return.
       */
      top: 10,
      /**
       * Order by field
       */
      by: 'createdAt'
    };

module.exports = function(Model, options) {
  options = merge({}, defaults, options || {});

  /**
   * Main lookup method
   */
  Model.recent = function(filter, next) {
    filter = merge({
      order: options.by + ' DESC',
      limit: options.top
    }, filter || {});

    this.find(filter, next);
  };


  /**
   * Remoting
   * GET /recent?[filter=]
   */
  Model.remoteMethod('recent', {
    http: {
      verb: 'get'
    },
    accepts: [
      {arg: 'filter', type: 'object', http: {source: 'query'}}
    ],
    returns: {type: 'array', root: true}
  });

};
