module.exports = {
  apps: [
    {
      name: 'hidden-gems-backend',
      script: './backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
