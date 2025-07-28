module.exports = {
  'apps': [
    {
      'name': 'sayu-backend',
      'script': 'sayu-living-server.js',
      'instances': 1,
      'exec_mode': 'fork',
      'node_args': '--max-old-space-size=2048 --optimize-for-size',
      'max_memory_restart': '1800MB',
      'env': {
        'NODE_ENV': 'production',
        'PORT': 3001
      },
      'error_file': './logs/err.log',
      'out_file': './logs/out.log',
      'log_file': './logs/combined.log',
      'time': true,
      'autorestart': true,
      'max_restarts': 10,
      'min_uptime': '10s'
    }
  ]
};
