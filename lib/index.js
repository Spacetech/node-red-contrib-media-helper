"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ecolect = require("ecolect");
const en = require("ecolect/language/en");
const any = require("ecolect/values/any");
const conversation_1 = require("./conversation");
const conversations = new Map();
function setupEcolet(customActions) {
    let intents = ecolect.intents(en);
    for (const customAction of customActions) {
        let intent = intents.intent(customAction.name);
        const intentValues = [];
        const regex = /{(.*?)}/gm;
        for (const phrase of customAction.phrases) {
            let match;
            do {
                match = regex.exec(phrase);
                if (match) {
                    const value = match[1];
                    if (intentValues.indexOf(value) === -1) {
                        intentValues.push(value);
                    }
                }
            } while (match);
        }
        for (const value of intentValues) {
            intent = intent.value(value, any());
        }
        for (const phrase of customAction.phrases) {
            intent = intent.add(phrase);
        }
        intents = intent.done();
    }
    return intents.build();
}
module.exports = (RED) => {
    function MediaHelperNode(config) {
        RED.nodes.createNode(this, config);
        const coachPotatoApiUrl = config.coachPotatoApiUrl;
        const intents = setupEcolet(config.customActions);
        this.on("input", (inputGoogleAction) => __awaiter(this, void 0, void 0, function* () {
            let conversation = conversations.get(inputGoogleAction.conversationId);
            if (conversation === undefined) {
                conversation = new conversation_1.default(coachPotatoApiUrl);
                conversations.set(inputGoogleAction.conversationId, conversation);
            }
            const input = inputGoogleAction.payload.toLocaleLowerCase().trim();
            const response = yield conversation.process(input);
            if (response.endConversation) {
                conversations.delete(inputGoogleAction.conversationId);
            }
            const messages = new Array(1 + config.customActions.length);
            if (response.message === undefined) {
                const intent = yield intents.match(input);
                if (intent.best) {
                    messages[0] = {
                        conversationId: inputGoogleAction.conversationId,
                        dialogState: {},
                        payload: intent.best,
                        closeConversation: false
                    };
                }
                else {
                    response.message = "Welcome to Media Helper!";
                }
            }
            if (response.message !== undefined) {
                messages[0] = {
                    conversationId: inputGoogleAction.conversationId,
                    dialogState: {},
                    payload: response.message,
                    closeConversation: false
                };
            }
            this.send(messages);
        }));
    }
    RED.nodes.registerType("media-helper", MediaHelperNode);
};
//# sourceMappingURL=index.js.map