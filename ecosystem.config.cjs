/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: 'nivora-api',
      script: 'server/index.js',
      interpreter: 'node',
      watch: false,
      env: {
        NODE_ENV: 'production',
        API_PORT: 4011,
        // All secrets are injected from environment variables / Replit Secrets.
        // Do NOT hardcode credentials here.
      },
    },
  ],
}
