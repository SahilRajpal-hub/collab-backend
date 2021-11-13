const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
});
const util = require("../../utils/util");
const { v4: uuidv4 } = require("uuid");
const collabTable = "collab_db";
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createRequest(senderId, recieverId) {
  const requestId = uuidv4();
  const request = {
    id: requestId,
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
      async (res) => {
        const sender = await getUserById(senderId);
        const reciever = await getUserById(recieverId);
        sender.requestSent = sender.requestSent
          ? [...sender.requestSent, requestId]
          : [requestId];
        reciever.requestRecieved = reciever.requestRecieved
          ? [...reciever.requestRecieved, requestId]
          : [requestId];
        await updateUserSendingRequest(senderId, sender);
        await updateUserRecievingRequest(recieverId, reciever);
        return util.buildResponse(200, { ...request });
      },
      (err) => {
        console.log(err);
        return util.buildResponse(500, { msg: "Internal Server Error" });
      }
    );
}

async function getRequestById(id) {
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

async function deleteRequestWithId(requestId) {
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

async function deleteRequest(senderId, recieverId) {
  const sender = await getUserById(senderId);
  const reciever = await getUserById(recieverId);

  const sentRequests = sender.requestSent ? [...sender.requestSent] : [];
  const recievedRequest = reciever.requestRecieved
    ? [...reciever.requestRecieved]
    : [];

  const requestId = sentRequests.filter((rq) => recievedRequest.includes(rq));
  return await deleteRequestWithId(requestId[0]);
}

async function requestRecievedOfUser(userId) {
  const user = await getUserById(userId);
  if (!user.requestRecieved) return util.buildResponse(200, { requests: [] });
  return util.buildResponse(200, { requests: [...user.requestRecieved] });
}

async function requestSentOfUser(userId) {
  const user = await getUserById(userId);
  if (!user.requestSent) return util.buildResponse(200, { requests: [] });
  return util.buildResponse(200, { requests: [...user.requestSent] });
}

async function updateUserSendingRequest(senderId, requestSent) {
  const params = {
    TableName: collabTable,
    Key: {
      id: senderId,
    },
    UpdateExpression: "set requestSent = :r",
    ExpressionAttributeValue: {
      ":r": requestSent,
    },
    ReturnValues: "UPDATED_NEW",
  };

  return await dynamodb
    .update(params)
    .promise()
    .then(
      (res) => {
        return res;
      },
      (err) => {
        console.log(err);
      }
    );
}

async function updateUserRecievingRequest(recieverId, requestRecieved) {
  const params = {
    TableName: collabTable,
    Key: {
      id: recieverId,
    },
    UpdateExpression: "set requestRecieved = :r",
    ExpressionAttributeValue: {
      ":r": requestRecieved,
    },
    ReturnValues: "UPDATED_NEW",
  };

  return await dynamodb
    .update(params)
    .promise()
    .then(
      (res) => {
        return res;
      },
      (err) => {
        console.log(err);
      }
    );
}

module.exports = {
  createRequest,
  deleteRequest,
  deleteRequestWithId,
  requestSentOfUser,
  requestRecievedOfUser,
  getRequestById,
};
