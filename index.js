const registerService = require("./service/user/register");
const loginService = require("./service/user/login");
const verifyService = require("./service/user/verify");
const { getUserByEmail, getUserById } = require("./service/user/userDetails");
const util = require("./utils/util");
const {
  friendTheUser,
  unfriendTheUser,
} = require("./service/user/userOperations");
const { getUserFromToken } = require("./utils/auth");
const {
  createTask,
  getTaskById,
  getAllTasks,
  getAllTaskWherePartner,
  getAllTaskWhereOwner,
} = require("./service/task/taskDetails");
const { deleteTask } = require("./service/task/taskOperations");

const healthPath = "/health";
const registerPath = "/user/register";
const loginPath = "/user/login";
const verifyPath = "/user/auth";
const userPath = "/user/{uid}";
const getUserInfoPath = "/user/info/{uid}";
const friendPath = "/user/friend/{todo}";
const taskPath = "/task/{id}";
const searchTaskPath = "/task/search";
const getAllTaskPath = "/task/all";
const createTaskPath = "/task";
const getAllTaskOfUserPath = "/task/all/{id}";

exports.handler = async (event) => {
  console.log("Request Event: ", event);
  /*
    event['pathParameters']['param1']
    event["queryStringParameters"]['queryparam1']
    event['requestContext']['identity']['userAgent']
    event['requestContext']['identity']['sourceIP']
  */
  let response;
  let uid;
  let secondUserId;
  let firstUser;
  let firstUserId;
  let id;

  switch (true) {
    case event.httpMethod === "GET" && event.path === healthPath:
      response = util.buildResponse(200);
      break;
    case event.httpMethod === "POST" && event.path === registerPath:
      const registerBody = JSON.parse(event.body);
      response = await registerService.register(registerBody);
      break;
    case event.httpMethod === "POST" && event.path === loginPath:
      const loginBody = JSON.parse(event.body);
      response = await loginService.login(loginBody);
      break;
    case event.httpMethod === "POST" && event.path === verifyPath:
      const verifyBody = JSON.parse(event.body);
      response = verifyService.verify(verifyBody);
      break;
    case event.httpMethod === "POST" &&
      event.resource === friendPath &&
      event["pathParameters"]["todo"] === "1":
      secondUserId = JSON.parse(event.body).id;
      firstUser = getUserFromToken(event["headers"]["x-access-token"]);
      console.log(firstUser);
      firstUserId = firstUser["id"];
      console.log(firstUserId, " ", secondUserId);
      response = await friendTheUser(firstUserId, secondUserId);
      break;
    case event.httpMethod === "POST" &&
      event.resource === friendPath &&
      event["pathParameters"]["todo"] === "0":
      secondUserId = JSON.parse(event.body).id;
      firstUser = getUserFromToken(event["headers"]["x-access-token"]);
      firstUserId = firstUser["id"];
      response = await unfriendTheUser(firstUserId, secondUserId);
      break;
    case event.httpMethod === "GET" &&
      event.resource === userPath &&
      event["queryStringParameters"]["uidtype"] === "email":
      uid = event["pathParameters"]["uid"];
      response = await getUserByEmail(uid);
      break;
    case event.httpMethod === "GET" &&
      event.resource === userPath &&
      event["queryStringParameters"]["uidtype"] === "id":
      uid = event["pathParameters"]["uid"];
      response = await getUserById(uid);
      break;
    case event.httpMethod === "GET" &&
      event.resource === getUserInfoPath &&
      event["queryStringParameters"]["uidtype"] === "email":
      uid = event["pathParameters"]["uid"];
      response = await getUserByEmail(uid);
      break;
    case event.httpMethod === "POST" && event.path === createTaskPath:
      const taskBody = JSON.parse(event.body);
      response = await createTask(taskBody);
      break;
    case event.httpMethod === "GET" && event.resource === taskPath:
      id = event["pathParameters"]["id"];
      response = await getTaskById(id);
      break;
    case event.httpMethod === "DELETE" && event.resource === taskPath:
      id = event["pathParameters"]["id"];
      response = await deleteTask(id);
      break;
    case event.httpMethod === "GET" && event.resource === getAllTaskOfUserPath:
      const partnerType = event["queryStringParameters"]["partnertype"];
      console.log(partnerType === "wherePartner");
      id = event["pathParameters"]["id"];
      if (partnerType === "All") response = await getAllTasks(id);
      else if (partnerType === "wherePartner")
        response = await getAllTaskWherePartner(id);
      else if (partnerType === "whereOwner")
        response = await getAllTaskWhereOwner(id);
      break;
    default:
      response = util.buildResponse(404, "404 Not Found");
  }
  return response;
};
