const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
});
const util = require("../../utils/util");
const { v4: uuidv4 } = require("uuid");
const collabTable = "collab_db";
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createRequest(senderId, recieverId) {
  const request = {
    id: uuidv4(),
    sender: senderId,
    reciever: recieverId,
  };

  const params = {
    TableName: collabTable,
    Item: request,
  };

  return await dynamodb
    .put(params)
    .promise()
    .then(
      (res) => {
        const sender = getUserById(senderId);
        const reciever = getUserById(recieverId);
        return util.buildResponse(200, { ...request });
      },
      (err) => {
        console.log(err);
        return util.buildResponse(500, { msg: "Internal Server Error" });
      }
    );
}

async function getUserById(id) {
  const params = {
    TableName: collabTable,
    Key: {
      id: id,
    },
  };

  return await dynamodb
    .get(params)
    .promise()
    .then(
      (response) => {
        return response.Item;
      },
      (error) => {
        console.error("There is an error getting user: ", error);
        throw new Error(error);
      }
    );
}

async function deleteRequest(requestId) {
  const params = {
    TableName: collabTable,
    Key: {
      id: requestId,
    },
  };
  dynamodb
    .delete(params)
    .promise()
    .then(
      (res) => {
        return util.buildResponse(200, { msg: "Deletion successfull" });
      },
      (err) => {
        console.log(err);
        return util.buildResponse(500, { msg: "Internal Server Error" });
      }
    );
}

async function deleteRequest(senderId, recieverId) {}

async function requestOfUser(userId) {}

module.exports = { createRequest, deleteRequest };
