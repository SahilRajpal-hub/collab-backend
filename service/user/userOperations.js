const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
});
const util = require("../../utils/util");
const collabTable = "collab_db";
const idxName = "email-index";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function friendTheUser(firstUserId, secondUserId) {
  // firstUser sending request to second user
  const firstUser = await getUserById(firstUserId);
  const secondUser = await getUserById(secondUserId);

  // check if both user exist
  if (!firstUser && !secondUser) {
    return util.buildResponse(404, { msg: "User not found" });
  }

  if (firstUser.friends.indexOf(secondUserId) > 0) {
    return util.buildResponse(400, { msg: "Friends Already" });
  }

  const firstUserFriendList = [...firstUser.friends];
  firstUserFriendList.push(secondUserId);

  const secondUserFriendList = [...secondUser.friends];
  secondUserFriendList.push(firstUserId);

  let params = {
    TableName: collabTable,
    Key: {
      id: firstUserId,
    },
    UpdateExpression: "set friends = :r",
    ExpressionAttributeValues: {
      ":r": firstUserFriendList,
    },
    ReturnValues: "UPDATED_NEW",
  };

  return await dynamodb
    .update(params)
    .promise()
    .then(
      (response) => {
        let params2 = {
          TableName: collabTable,
          Key: {
            id: secondUserId,
          },
          UpdateExpression: "set friends = :r",
          ExpressionAttributeValues: {
            ":r": secondUserFriendList,
          },
          ReturnValues: "UPDATED_NEW",
        };

        return await dynamodb
          .update(params2)
          .promise()
          .then(
            (response2) => {
              return util.buildResponse(200, { ...response, ...response2 });
            },
            (err) => {
              console.log("got error while updating data", err);
              return util.buildResponse(500, {
                msg: "error while updating data",
              });
            }
          );
      },
      (err) => {
        console.log("got error while updating data", err);
        return util.buildResponse(500, { msg: "error while updating data" });
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

  const user = await dynamodb
    .get(params)
    .promise()
    .then(
      (response) => {
        return response.Item;
      },
      (error) => {
        console.error("There is an error getting user: ", error);
      }
    );

  return user;
}

module.exports = {
  friendTheUser,
};
