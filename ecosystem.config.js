
module.exports = {
  apps: [
    {
      name: 'whatsappersaas',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3019',
      cwd: '/home/ftpuser/files/clients/whatsappersaas',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};

