import {
  AzureFunction,
  Context,
  HttpRequest,
  HttpMethod,
} from "@azure/functions";
import fetch from "node-fetch";

const handleStravaWebhook: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    switch (req.method) {
      case "POST":
        await makeSubscription(context, req);
        break;
      case "GET":
        await validateSubscription(context, req);
        break;
      default:
        context.res = {
          status: 400,
          body: "Invalid Request",
        };
        break;
    }
  } catch (e) {
    context.res = {
      status: 500,
      body: e.message,
    };
  }
};

const makeSubscription = async function (context: Context, req: HttpRequest) {
  context.log("makeSubscription");
  const stravaResponse = await fetch(
    "https://www.strava.com/api/v3/push_subscriptions",
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: req.rawBody,
    }
  );

  const stravaResponseBody = await stravaResponse.json();
  context.res.status = stravaResponse.status;
  context.res.json = stravaResponseBody;
};

const validateSubscription = function (context: Context, req: HttpRequest) {
  context.log("validateSubscription");
  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const verifyToken = req.query["hub.verify_token"];

  context.res.json({
    "hub.challenge": challenge,
  });
};

export default handleStravaWebhook;
