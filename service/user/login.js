const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
});
const util = require("../../utils/util");
const bcrypt = require("bcryptjs");
const auth = require("../../utils/auth");

const dynamodb = new AWS.DynamoDB.DocumentClient();
const collabTable = "collab_db";
const idxName = "email-index";

async function login(user) {
  const email = user.email;
  const password = user.password;
  if (!user || !email || !password) {
    return util.buildResponse(401, {
      message: "email and password are required",
    });
  }

  const dynamoUser = await getUserByEmail(email.toLowerCase().trim());
  console.log(dynamoUser);
  if (!dynamoUser || !dynamoUser.email) {
    return util.buildResponse(403, { message: "user does not exist" });
  }

  if (!bcrypt.compareSync(password, dynamoUser.password)) {
    return util.buildResponse(403, { message: "password is incorrect" });
  }

  const userInfo = {
    email: dynamoUser.email,
    name: dynamoUser.name,
    id: dynamoUser.id,
  };
  const token = auth.generateToken(userInfo);
  const response = {
    user: userInfo,
    token: token,
  };
  return util.buildResponse(200, response);
}

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
        console.log(response.Items);
        return response.Items[0];
      },
      (error) => {
        console.error("There is an error getting user: ", error);
      }
    );
}

module.exports.login = login;
