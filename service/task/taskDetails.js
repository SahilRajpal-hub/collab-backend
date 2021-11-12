const AWS = require("aws-sdk");
AWS.config.update({
  region: "us-east-1",
});
const util = require("../../utils/util");
const { v4: uuidv4 } = require("uuid");
const collabTable = "collab_db";
const dynamodb = new AWS.DynamoDB.DocumentClient();

// @api
// @params -> {topic, description,owner,deadline,completion,partner,link,document,id }
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
  const userId = body.id;

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

  console.log(task);

  const params = {
    TableName: collabTable,
    Item: task,
  };

  return await dynamodb
    .put(params)
    .promise()
    .then(
      async (response) => {
        await updateUserTask(userId, task.id);
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
    .get(params)
    .promise()
    .then(
      (response) => {
        return response.Item;
      },
      (err) => {
        console.log(err);
        return util.buildResponse(500, {
          msg: "Internal Server error while fetching the task",
        });
      }
    );

  return util.buildResponse(200, task);
}

async function updateUserTask(userId, taskId) {
  const user = await getUserById(userId);
  if (!user.tasksOwner) {
    user.tasksOwner = [];
  }
  const newTaskList = [...user.tasksOwner, taskId];

  const params = {
    TableName: collabTable,
    Key: {
      id: userId,
    },
    UpdateExpression: "set tasksOwner = :r",
    ExpressionAttributeValues: {
      ":r": newTaskList,
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
        return { msg: "Internal Server Error" };
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

async function getAllTaskWherePartner(userId) {
  const user = await getUserById(userId);
  console.log(user);
  if (!user.tasksPartner) user.tasksPartner = [];
  const tasksUser = [...user.tasksPartner];
  return util.buildResponse(200, tasksUser);
}

async function getAllTaskWhereOwner(userId) {
  const user = await getUserById(userId);
  if (!user.tasksOwner) user.tasksOwner = [];
  const tasksUser = [...user.tasksOwner];
  return util.buildResponse(200, tasksUser);
}

async function getAllTasks(userId) {
  const user = await getUserById(userId);
  console.log(user);
  if (!user.tasksPartner) user.tasksPartner = [];
  if (!user.tasksOwner) user.tasksOwner = [];
  const allTasks = [...user.tasksPartner, ...user.tasksOwner];
  return util.buildResponse(200, allTasks);
}

module.exports = {
  createTask,
  getTaskById,
  getAllTaskWherePartner,
  getAllTaskWhereOwner,
  getAllTasks,
};
