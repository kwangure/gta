import { sendMessageToRuntime, sendMessageToTabs } from "./emit.js";
import typeOf from "just-typeof";

export class EventHandler {
    constructor() {
        this._onEventListeners = new Map();
        const self = this;
        this._eventHandler = (message, _sender, sendResponseFn) => {
            const { event: eventName, payload } = message;
            const eventListeners = self._onEventListeners.get(eventName) || [];

            for (const listener of eventListeners) {
                listener(payload, sendResponseFn);
            }

            return true;
        };

        chrome.runtime.onMessage.addListener(this._eventHandler);
    }
    on(event, newListener) {
        const listeners = this._onEventListeners.get(event) || new Set();
        this._onEventListeners.set(event, listeners.add(newListener));

        const self = this;
        return function unsubscribe() {
            const listeners = self._onEventListeners.get(event);
            listeners.delete(newListener);
        };
    }
    removeListeners() {
        if (chrome.runtime.onMessage.hasListener(this._eventHandler)) {
            chrome.runtime.onMessage.removeListener(this._eventHandler);
        }
    }
    emit({ event, payload = {}, runtime = true, tabs = {}}) {
        if (tabs) {
            sendMessageToTabs({ event, tabs, payload });
        }

        if (runtime) {
            sendMessageToRuntime({ event, payload });
        }
    }
    request(options) {
        let payload = {};
        let event = "";
        if (typeOf(options) === "object") {
            ({ query: event, payload } = options);
        } else if (typeOf(options) === "string") {
            event = options;
        } else {
            throw TypeError("Expected String or Object options.");
        }

        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ event, payload }, (response) => {
                const { lastError } = chrome.runtime;
                if (lastError) {
                    console.error("Unable to respond to request", lastError.message);
                }
                resolve(response);
            });
        });
    }
}
