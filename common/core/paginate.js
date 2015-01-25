/**
 * Paginate Mixin
 */
module.exports = function(model) {
  if(!model) {
    throw new Error('Model should be a constructor');
  }

  /**
   * Pagination.
   * I wish js had pattern matching, duh.
   */
  model.paginate = function(page, offset, filter, next) {
    var args = [].slice.call(arguments).filter(function(arg) {
      return arg !== undefined; //remote method call it with undefined
    }),
        length = args.length;

    if(length < 2) {
      throw new Error('Page is required.');
    }
    if(length === 2) { //paginate(10, next)
      page = args[0];
      offset = 0;
      filter = {};
      next = args[1];
    }
    //paginate(10, offset, next) or paginate(10, filter, next)
    if(length === 3) {
      page = args[0];
      if(typeof args[1] === 'object') { //filter was passed
        filter = args[1];
        offset = 0;
      }
      else { //offset was passed
        filter = {};
        offset = args[1];
      }
      next = args[2];
    }

    filter.limit = page; //set page size

    model.count(filter.where || {}, function(err, count) {
      var pages = Math.ceil(count/page);
      if(err != null) {
        next(err);
      }
      else {
        filter.offset = page*offset;
        model.find(filter, function(err, data) {
          if(err != null) {
            next(err);
          }
          else {
            next(err, {
              data: data,
              total: count,
              page: offset + 1,
              pages: pages
            });
          }
        });
      }
    });
  };

  //Expose method via HTTP
/*  model.remoteMethod('paginate', {
    http: {
      path: '/paginate/:size',
      verb: 'get'
    },
    accepts: [
      {arg: 'size', type: 'number', required: true, http: {source: 'path'}},
      {arg: 'filter', type: 'object', http: {source: 'query'}}
    ],
    returns: {arg: 'data', type: 'object', root: true}
  });*/

  //Expose method via HTTP
  model.remoteMethod('paginate', {
    http: {
      path: '/paginate/:size/:page',
      verb: 'get'
    },
    accepts: [
      {arg: 'size', type: 'number', required: true, http: {source: 'path'}},
      {arg: 'page', type: 'number', required: true, http: {source: 'path'}},
      {arg: 'filter', type: 'object', http: {source: 'query'}}
    ],
    returns: {arg: 'data', type: 'object', root: true}
  });
};
