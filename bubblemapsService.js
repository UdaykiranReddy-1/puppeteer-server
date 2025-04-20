const axios = require('axios');

const getMapMetadata = async (chain, token) => {
  try {
    const response = await axios.get(`https://api-legacy.bubblemaps.io/map-metadata?chain=${chain}&token=${token}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching map metadata:', error);
    return { status: 'KO', message: 'Failed to fetch map metadata' };
  }
};

const getMapAvailability = async (chain, token) => {
  try {
    const response = await axios.get(`https://api-legacy.bubblemaps.io/map-availability?chain=${chain}&token=${token}`);
    return response.data;
  } catch (error) {
    console.error('Error checking map availability:', error);
    return { status: 'KO', message: 'Failed to check map availability' };
  }
};

const getMapData = async (chain, token) => {
  try {
    const response = await axios.get(`https://api-legacy.bubblemaps.io/map-data?chain=${chain}&token=${token}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching map data:', error);
    return {
      version: 0,
      chain: '',
      token_address: '',
      dt_update: '',
      full_name: '',
      symbol: '',
      is_X721: false,
      metadata: { max_amount: 0, min_amount: 0 },
      nodes: [],
      status: 'KO',
      message: 'Failed to fetch map data'
    };
  }
};

const getMapIframeUrl = (chain, token) => {
  return `https://app.bubblemaps.io/${chain}/token/${token}`;
};

module.exports = {
  getMapMetadata,
  getMapAvailability,
  getMapData,
  getMapIframeUrl
};
