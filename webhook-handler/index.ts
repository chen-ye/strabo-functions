import { AzureFunction, Context, HttpRequest, HttpMethod } from "@azure/functions"
import fetch from 'node-fetch';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');
    switch (req.method) {
        case "POST":
            makeSubscription(context, req);
        case "GET":
            validateSubscription(context, req);
            break;
        default:
            context.res = {
                status: 500,
                body: "Invalid Request"
            }
    }
    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };

};

const makeSubscription = async function (context: Context, req: HttpRequest) {
    const stravaResponse = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
        method: 'post',
        headers: req.headers,
        body: req.body
    });

    const stravaResponseBody = await stravaResponse.json();
    context.res = {
        body: stravaResponseBody
    }
}

const validateSubscription = function (context: Context, req: HttpRequest) {
    const mode = req.query['hub.mode'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = req.query['hub.verify_token'];

    context.res = {
        body: {
            'hub.challenge': challenge,
        }
    }
}

export default httpTrigger;
