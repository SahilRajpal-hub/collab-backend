const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
});
const util = require("../../utils/util");
const bcrypt = require("bcryptjs");

const dynamodb = new AWS.DynamoDB.DocumentClient();
const collabTable = "collab_db";
const idxName = "email-index";
const { v4: uuidv4 } = require("uuid");

async function register(userInfo) {
  const name = userInfo.name;
  const email = userInfo.email;
  const password = userInfo.password;
  if (!name || !email || !password) {
    return util.buildResponse(401, {
      message: "All fields are required",
    });
  }

  const dynamoUser = await getUserByEmail(email.toLowerCase().trim());
  if (dynamoUser && dynamoUser.email) {
    return util.buildResponse(401, {
      message: "email already exists in our database. Try Login",
    });
  }

  const encryptedPW = bcrypt.hashSync(password.trim(), 10);
  const userId = uuidv4();
  const user = {
    name: name,
    email: email,
    password: encryptedPW,
    id: userId,
  };

  const saveUserResponse = await saveUser(user);
  if (!saveUserResponse) {
    return util.buildResponse(503, {
      message: "Server Error. Please try again later.",
    });
  }

  return util.buildResponse(200, { email: email, id: userId });
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
      }
    );
}

async function saveUser(user) {
  const params = {
    TableName: collabTable,
    Item: user,
  };
  return await dynamodb
    .put(params)
    .promise()
    .then(
      () => {
        return true;
      },
      (error) => {
        console.error("There is an error saving user: ", error);
      }
    );
}

module.exports.register = register;
