# Overview

A Lambda function to scrape https://www.finder.com.au/coronavirus-testing-locations website to retrieve the data table about COVID-19 testing locations in Australia

The result will then be converted to JSON file and uploaded to S3 bucket. The S3 endpoint will then be added to a Postman collection and submitted to https://github.com/postmanlabs/covid-19-apis to allow easy access to such a critical information for further use outside finder.com.au

In order to keep the list up to date and in sync with the original source, I have set a schedule AWS CloudWatch to run the Lambda function to scrape the web once a day every day

## Technology

- AWS DynamoDB
- AWS S3
- [Serverless Framework](https://serverless.com/)

## Thanks

Special thanks to [Harriet](https://github.com/harrietty) for his/her code example to create a web scraper using AWS Lambda & Serverless (https://github.com/harrietty/AWS-donkeyjob-scraper/blob/master/helpers.js)
