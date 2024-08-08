import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import AWS from 'aws-sdk';
import { getUserId } from '../utils.mjs';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function getTodosHandler(event) {
  const userId = getUserId(event);
  console.log(userId)
  const params = {
    TableName: process.env.TODOS_TABLE,
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };

  const result = await dynamoDb.query(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Items),
  };
}

export const handler = middy(getTodosHandler)
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
    })
  );
