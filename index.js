const registerService = require("./service/user/register");
const loginService = require("./service/user/login");
const verifyService = require("./service/user/verify");
const { getUserByEmail, getUserById } = require("./service/user/userDetails");
const util = require("./utils/util");

const healthPath = "/health";
const registerPath = "/user/register";
const loginPath = "/user/login";
const verifyPath = "/user/auth";
const getUserPath = "/user/{uid}";
const getUserInfoPath = "/user/info/{uid}";

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
    case event.httpMethod === "GET" &&
      event.resource === getUserPath &&
      event["queryStringParameters"]["uidtype"] === "email":
      uid = event["pathParameters"]["uid"];
      response = await getUserByEmail(uid);
      break;
    case event.httpMethod === "GET" &&
      event.resource === getUserPath &&
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
    case event.httpMethod === "GET" &&
      event.resource === getUserInfoPath &&
      event["queryStringParameters"]["uidtype"] === "id":
      uid = event["pathParameters"]["uid"];
      response = await getUserById(uid);
      break;
    default:
      response = util.buildResponse(404, "404 Not Found");
  }
  return response;
};
