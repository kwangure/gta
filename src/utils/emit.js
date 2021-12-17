import typeOf from "just-typeof";

// @ts-nocheck
function get_tab_statuses(tab_ids) {
    return Promise.all(tab_ids
        .map((id) => new Promise((r) => chrome.tabs.get(id, r))));
}

export async function sendMessageToTabs(message) {
    if (chrome.tabs) {
        let tabs;
        switch (typeOf(message.tabs)) {
            case "array":
                tabs = await get_tab_statuses(message.tabs);
                break;
            case "object":
                tabs = await chrome.tabs.query({});
                break;
            default:
                throw Error("Expected `options.tabs` to be a 'TabID[]' of tabs or 'TabQuery'.");
        }

        for (const { id, status, url } of tabs) {
            // Ignore tabs in loading status
            if (status !== "complete") break;

            chrome.tabs.sendMessage(id, message, {}, () => {
                const { lastError } = chrome.runtime;
                if (lastError) {
                    console.error(`Unable to send message to tab (url: ${url}, id: ${id}, status: ${status}).`, lastError.message);
                }
            });
        }
    }
}

export function sendMessageToRuntime(message) {
    // Send messages to other frames e.g extension url, options, popup etc.
    chrome.runtime.sendMessage(message, () => {
        const { lastError } = chrome.runtime;
        if (lastError) {
            console.error("Unable to send message to runtime.", lastError.message);
        }
    });
}
