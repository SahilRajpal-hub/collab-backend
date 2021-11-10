const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
});

const { v4: uuidv4 } = require("uuid");

const dynamodb = new AWS.DynamoDb.DocumentClient();
const collabTable = "collab_db";
const util = require("../../utils/util");

async function updateTask(updatedTask) {
  const id = updateTask.id;
  const params = {
    TableName: collabTable,
    Key: {
      id: id,
    },
  };
}

module.exports = { updateTask };
