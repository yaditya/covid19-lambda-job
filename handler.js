const request = require('axios');
const { extractListingsFromHTML } = require('./helpers');
const URL = 'https://www.finder.com.au/coronavirus-testing-locations';

module.exports.getTestingLocations = async (e, c, callback) => {
  request(URL)
    .then(({ data }) => {
      if (data.status !== 200) {
        return callback(null, {
          statusCode: data.status,
          body: JSON.stringify({ error: 'Could not fetch data' }),
        });
      }

      const jobs = extractListingsFromHTML(data);
      return callback(null, { jobs });
    })
    .catch((error) => {
      console.error(error);
      return callback(null, {
        statusCode: 500,
        body: JSON.stringify({ error }),
      });
    });
};
