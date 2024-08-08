import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import AWS from 'aws-sdk';
import { getUserId } from '../utils.mjs';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function updateTodoHandler(event) {
  const { todoId } = event.pathParameters;
  const updatedTodo = JSON.parse(event.body);
  const userId = getUserId(event)
  const params = {
    TableName: process.env.TODOS_TABLE,
    Key: {
      userId,
      todoId
    },
    UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
    ExpressionAttributeNames: {
      "#name": "name",
    },
    ExpressionAttributeValues: {
      ":name": updatedTodo.name,
      ":dueDate": updatedTodo.dueDate,
      ":done": updatedTodo.done,
    },
    ReturnValues: "ALL_NEW",
  };

  const result = await dynamoDb.update(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(result.Attributes),
  };
}

export const handler = middy(updateTodoHandler)
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
    })
  );
