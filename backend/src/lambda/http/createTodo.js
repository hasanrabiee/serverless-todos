import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';
import { getUserId } from '../utils.mjs';

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function createTodoHandler(event) {
  const newTodo = JSON.parse(event.body);
  const todoId = uuidv4();
  const createdAt = new Date().toISOString();
  const userId = getUserId(event);

  const params = {
    TableName: process.env.TODOS_TABLE,
    Item: {
      todoId,
      createdAt,
      name: newTodo.name,
      dueDate: newTodo.dueDate,
      done: false,
      attachmentUrl: null,
      userId: userId,
    },
  };

  await dynamoDb.put(params).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      todoId,
      createdAt,
      ...newTodo,
      done: false,
      attachmentUrl: null,
    }),
  };
}

export const handler = middy(createTodoHandler)
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
    })
  );
