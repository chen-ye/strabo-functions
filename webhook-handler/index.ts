import { AzureFunction, Context, HttpRequest, HttpMethod } from "@azure/functions"
import fetch from 'node-fetch';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
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
                    body: "Invalid Request"
                }
                break;
        }
    } catch (e) {
        context.res = {
            status: 500,
            body: e.message,
        }
    }

};

const makeSubscription = async function (context: Context, req: HttpRequest) {
    context.log('makeSubscription');
    const stravaResponse = await fetch('https://www.strava.com/api/v3/push_subscriptions', {
        method: 'post',
        headers: req.headers,
        body: req.body
    });

    const stravaResponseBody = await stravaResponse.json();
    context.res = {
        status: stravaResponse.status,
        body: stravaResponseBody
    };
}

const validateSubscription = function (context: Context, req: HttpRequest) {
    context.log('validateSubscription');
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
