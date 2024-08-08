import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import AWS from 'aws-sdk';
import { getUserId } from '../utils.mjs';

const s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function generateUploadUrlHandler(event) {
  const { todoId } = event.pathParameters;
  const userId = getUserId(event);

  const bucketName = process.env.S3_BUCKET;
  const urlExpiration = 30000; // URL expiration time in seconds

  const s3Params = {
    Bucket: bucketName,
    Key: `${todoId}.jpg`, // assuming the file will be a .jpg
    Expires: urlExpiration,
  };

  try {
    const uploadUrl = s3.getSignedUrl('putObject', s3Params);

    // Update the DynamoDB table with the attachment URL
    const updateParams = {
      TableName: process.env.TODOS_TABLE,
      Key: { todoId,userId },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
        ":attachmentUrl": uploadUrl.split("?")[0],
      },
      ReturnValues: "ALL_NEW",
    };

    await dynamoDb.update(updateParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl }),
    };
  } catch (error) {
    console.error('Error generating upload URL: ', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Could not generate the upload URL',
      }),
    };
  }
}

export const handler = middy(generateUploadUrlHandler)
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
    })
  );
