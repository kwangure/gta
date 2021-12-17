import { event_handler } from "~@utils/event.js";

const filter = {
    urls: ["https://translate.google.com/_/TranslateWebserverUi/data/*"],
};

const request_bodies = new Map();
chrome.webRequest.onBeforeRequest.addListener((details) => {
    request_bodies.set(details.requestId, details.requestBody);
}, filter, ["requestBody"]);

chrome.webRequest.onBeforeSendHeaders.addListener((details) => {
    const { requestId: request_id, url } = details;
    const request_body = request_bodies.get(request_id);
    if (!request_body) {
        throw Error(`Request is missing body. URL: '${url}'`);
    }
    request_bodies.delete(request_id);

    const query = Object.fromEntries(new URL(url).searchParams);
    const { rpcids, is_ext } = query;

    // Ignore requests the extension made from the client
    if (is_ext) return;

    let type;
    switch (rpcids) {
        case "MkEWBc": {
            type = "translate";
            break;
        }
        case "jQ1olc": {
            type = "audio";
            break;
        }
        default:
            // We only care about `audio` and `translate` requests
            return;
    }

    console.log({ details });

    event_handler.emit({
        event: "BATCH_REQUEST",
        tabs: [details.tabId],
        runtime: false,
        payload: {
            method: details.method,
            request_body,
            query,
            request_headers: details.requestHeaders,
            type,
            url,
        },
    });
}, filter, ["requestHeaders"]);
