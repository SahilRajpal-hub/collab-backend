const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
});
const util = require("../../utils/util");
const { v4: uuidv4 } = require("uuid");
const collabTable = "collab_db";
const idxName = "email-index";
const dynamodb = new AWS.DynamoDb.DocumentClient();

async function createTask(body) {
  const {
    topic,
    description,
    owner,
    deadline,
    completion,
    partner,
    link,
    document,
  } = body;

  if (!topic || !description || !owner) {
    return util.buildResponse(400, {
      msg: "Topic and description is neccessary for the user",
    });
  }

  const task = {
    id: uuidv4(),
    topic,
    description,
    owner,
    deadline,
    completion,
    partner,
    link,
    document,
  };

  const params = {
    TableName: collabTable,
    Item: task,
  };

  return await dynamodb
    .put(params)
    .promise()
    .then(
      (response) => {
        return util.buildResponse(201, { msg: "Task successfully created" });
      },
      (err) => {
        return util.buildResponse(500, {
          msg: "Internal Server error while saving task!",
        });
      }
    );
}

async function getTaskById(id) {
  const params = {
    TableName: collabTable,
    Key: {
      id: id,
    },
  };

  const task = await dynamodb
    .query(params)
    .promise()
    .then(
      (response) => {
        return response.Item;
      },
      (err) => {
        return util.buildResponse(500, {
          msg: "Internal Server error while fetching the task",
        });
      }
    );
}

async function getAllTaskWithPartner(id) {}
async function getAllTaskWithoutPartner(id) {}

async function getAllTasks(id) {
  const taskWithPartner = await getAllTaskWithPartner(id);
  const taskWithoutPartner = await getAllTaskWithoutPartner(id);
  return [...taskWithPartner, ...taskWithoutPartner];
}

module.exports = {
  createTask,
  getTaskById,
  getAllTaskWithPartner,
  getAllTaskWithoutPartner,
  getAllTasks,
};
