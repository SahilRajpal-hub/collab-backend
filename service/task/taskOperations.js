const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const collabTable = "collab_db";
const util = require("../../utils/util");

async function deleteTask(taskId) {
  const params = {
    TableName: collabTable,
    Key: {
      id: taskId,
    },
  };

  return await dynamodb
    .delete(params)
    .promise()
    .then(
      (res) => {
        return util.buildResponse(200);
      },
      (err) => {
        return util.buildResponse(500, { msg: "Internal Server error" });
      }
    );
}

module.exports = { deleteTask };
