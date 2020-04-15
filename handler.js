const request = require('axios');
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const { differenceWith, isEqual } = require('lodash');
const { extractListingsFromHTML } = require('./helpers');
const URL = 'https://www.finder.com.au/coronavirus-testing-locations';
const params = {
  TableName: 'covid19jobs',
};

module.exports.getTestingLocations = async (e, c, callback) => {
  let allLocations;
  let newLocations;

  request(URL)
    .then(({ data }) => {
      // console.log('data', data);

      // if (data.status !== 200) {
      //   return callback(null, {
      //     statusCode: data.status,
      //     body: JSON.stringify({ error: 'Could not fetch data' }),
      //   });
      // }

      allLocations = extractListingsFromHTML(data);

      // Retrieve yesterday's jobs
      // return dynamo
      //   .scan({
      //     TableName: 'covid19jobs',
      //   })
      //   .promise();

      dynamo.scan(params, (error, result) => {
        // handle potential errors
        if (error) {
          console.error(error);
          callback(null, {
            statusCode: error.statusCode || 501,
            headers: { 'Content-Type': 'text/plain' },
            body: "Couldn't fetch the locations.",
          });
          return;
        }

        // create a response
        const response = {
          statusCode: 200,
          body: JSON.stringify(result.Items),
        };
        callback(null, response);
      });
    })
    .then((response) => {
      console.log('response', response);

      // Figure out which jobs are new
      let yesterdaysData = response.Items[0] ? response.Items[0].locations : [];

      newLocations = differenceWith(allLocations, yesterdaysData, isEqual);

      // Get the ID of yesterday's locations which can now be deleted
      const locationsToDelete = response.Items[0]
        ? response.Items[0].locationId
        : null;

      // Delete old jobs
      if (locationsToDelete) {
        return dynamo
          .delete({
            TableName: 'covid19jobs',
            Key: {
              locationId: locationsToDelete,
            },
          })
          .promise();
      } else return;
    })
    .then(() => {
      // Save the list of today's data
      return dynamo
        .put({
          TableName: 'covid19jobs',
          Item: {
            locationId: new Date().toString(),
            locations: allLocations,
          },
        })
        .promise();
    })
    .then(() => {
      callback(null, { locations: allLocations });
    })
    .catch((error) => {
      console.error(error);
      return callback(null, {
        statusCode: 500,
        body: JSON.stringify({ error }),
      });
    });
};
