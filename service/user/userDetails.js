const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
});
const util = require("../../utils/util");
const collabTable = "collab_db";
const idxName = "email-index";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getUserByEmail(email) {
  const params = {
    TableName: collabTable,
    IndexName: idxName,
    KeyConditionExpression: "#email = :v_email",
    ExpressionAttributeNames: {
      "#email": "email",
    },
    ExpressionAttributeValues: {
      ":v_email": email,
    },
  };

  return await dynamodb
    .query(params)
    .promise()
    .then(
      (response) => {
        return util.buildResponse(200, response.Items[0]);
      },
      (error) => {
        console.error("There is an error getting user: ", error);
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

  return util.buildResponse(200, user);
}

async function getUserProfilePic() {}

async function getMinInfoByEmail(email) {
  const params = {
    TableName: collabTable,
    Key: {
      email: email,
    },
  };
}

module.exports = {
  getUserByEmail,
  getUserById,
  getUserProfilePic,
  getMinInfoByEmail,
};
