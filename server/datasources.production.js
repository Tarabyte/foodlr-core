var env = process.env;

module.exports = {
  mongo: {
    host: env.DB_HOST || "127.0.0.1",
    port: env.DB_PORT || 27017,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: "foodlr",
    name: "mongo",
    connector: "mongodb"
  },
  images: {
    name: "images",
    connector: "loopback-component-storage",
    provider: "filesystem",
    root: "storage"
  }
};
