module.exports = function(Model) {
  Model.rubric = function(key, filter, next) {
    var ok = next.bind(this, undefined),
      fail = next;

    Model.app.models.Rubric
      .findOne({
        where: {
          keyword: key
        },
        fields: 'id'
      })
      .then(function(rubric){
        if(!rubric) {
          var notFound = new Error('Unable to find rubric with keyword ' + key);
          notFound.code = notFound.status = 404;
          throw notFound;
        }
        else {
          filter = filter || {};

          var where = filter.where || (filter.where = {});

          // holy shit we need this toString.
          where['rubrics.id'] = rubric.id.toString();

          return Model.find(filter);
        }
      })
      .then(ok, fail);
  };

  Model.remoteMethod('rubric', {
    http: {
      verb: 'get',
      path: '/rubric/:key'
    },
    returns: {
      type: 'array',
      root: true
    },
    accepts: [
      {
        arg: 'key',
        type: 'string',
        required: true,
        http: {
          source: 'path'
        }
      },
      {arg: 'filter', type: 'object', http: {source: 'query'}}
    ]
  });
};
