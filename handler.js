const request = require('axios');
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const { differenceWith, isEqual } = require('lodash');
const { extractListingsFromHTML } = require('./helpers');
const URL = 'https://www.finder.com.au/coronavirus-testing-locations';
const KEY_NAME = 'clinic-locations.json';
const params = {
  TableName: process.env.DYNAMODB_TABLE,
};

module.exports.getTestingLocations = (e, c, callback) => {
  let allLocations;
  let newLocations;

  request(URL)
    .then(({ data }) => {
      allLocations = extractListingsFromHTML(data);

      // Retrieve yesterday's jobs
      return dynamo.scan(params).promise();
    })
    .then((response) => {
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
            ...params,
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
          ...params,
          Item: {
            locationId: new Date().toString(),
            locations: allLocations,
          },
        })
        .promise();
    })
    .then(() => {
      const s3Params = {
        Bucket: process.env.BUCKET_NAME,
        Key: KEY_NAME,
        Body: JSON.stringify(allLocations),
        ContentType: 'application/json',
      };

      // Upload to S3
      return s3
        .putObject(s3Params, function (err, data) {
          if (err)
            console.log(`${JSON.stringify(err)} ${JSON.stringify(data)}`);
          return;
        })
        .promise();
    })
    .then(() => {
      callback(null, { locations: allLocations });
    })
    .catch(callback);
};
