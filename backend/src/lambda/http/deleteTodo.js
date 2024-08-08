import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import AWS from 'aws-sdk';
import { getUserId } from '../utils.mjs';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function deleteTodoHandler(event) {
  const { todoId } = event.pathParameters;
  const userId = getUserId(event)

  const params = {
    TableName: process.env.TODOS_TABLE,
    Key: {
      todoId,
      userId
    },
  };

  await dynamoDb.delete(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'TODO item deleted' }),
  };
}

export const handler = middy(deleteTodoHandler)
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
    })
  );
