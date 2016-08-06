module.exports = function(Cuisine) {

  /**
   * Return only popular cuisines order by popularity descending
   */
  Cuisine.popular = function(next) {
    return this.find({
      where: {
        popularity: {
          gt: 0
        }
      },
      order: 'popularity DESC'
    }, next);
  };

  /**
   * Remoting configuration
   */
  Cuisine.remoteMethod('popular', {
    http: {
      verb: 'get'
    },
    returns: {
      type: 'array',
      root: true
    }
  });

  return Cuisine;
};
