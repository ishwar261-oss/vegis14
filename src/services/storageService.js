const { env } = require('../config/env');

async function uploadAsset(file, folder = 'vegi14') {
  if (!env.cloudinary.cloudName) {
    return {
      url: file?.path || file?.url || '',
      provider: 'local-demo',
      folder
    };
  }
  return {
    url: file?.path || '',
    provider: 'cloudinary-ready',
    folder
  };
}

module.exports = { uploadAsset };
