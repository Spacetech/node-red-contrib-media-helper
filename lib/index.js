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
const conversation_1 = require("./conversation");
const conversations = new Map();
module.exports = (RED) => {
    function MediaHelperNode(config) {
        RED.nodes.createNode(this, config);
        const coachPotatoApiUrl = config.coachPotatoApiUrl;
        this.on("input", (inputGoogleAction) => __awaiter(this, void 0, void 0, function* () {
            let conversation = conversations.get(inputGoogleAction.conversationId);
            if (conversation === undefined) {
                conversation = new conversation_1.default(coachPotatoApiUrl);
                conversations.set(inputGoogleAction.conversationId, conversation);
            }
            const response = yield conversation.process(inputGoogleAction.payload.toLocaleLowerCase().trim());
            if (response.endConversation) {
                conversations.delete(inputGoogleAction.conversationId);
            }
            this.send({
                conversationId: inputGoogleAction.conversationId,
                dialogState: {},
                payload: response.message,
                closeConversation: false
            });
        }));
    }
    RED.nodes.registerType("media-helper", MediaHelperNode);
};
//# sourceMappingURL=index.js.map