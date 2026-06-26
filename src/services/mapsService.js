const { env } = require('../config/env');

function buildDirectionsUrl(origin, destination) {
  const originText = encodeURIComponent(origin || '');
  const destinationText = encodeURIComponent(destination || '');
  return `https://www.google.com/maps/dir/?api=1&origin=${originText}&destination=${destinationText}`;
}

function mapConfig() {
  return {
    provider: 'google-maps',
    apiKeyConfigured: Boolean(env.googleMapsApiKey)
  };
}

module.exports = { buildDirectionsUrl, mapConfig };
