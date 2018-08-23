import * as nodered from "node-red";

import Conversation from "./conversation";

interface MediaHelperNodeConfig extends nodered.NodeProperties {
	coachPotatoApiUrl: string;
}

interface IGoogleAction {
	conversationId: string;
	intent: string;
	userId: string;
	locale: string;
	dialogState: object;
	payload: string;
}

const conversations: Map<string, Conversation> = new Map();

module.exports = (RED: nodered.Red) => {
	function MediaHelperNode(config: MediaHelperNodeConfig) {
		RED.nodes.createNode(this, config);

		const coachPotatoApiUrl = config.coachPotatoApiUrl;

		this.on("input", async (inputGoogleAction: IGoogleAction) => {
			let conversation = conversations.get(inputGoogleAction.conversationId);
			if (conversation === undefined) {
				conversation = new Conversation(coachPotatoApiUrl);
				conversations.set(inputGoogleAction.conversationId, conversation);
			}

			const response = await conversation.process(inputGoogleAction.payload.toLocaleLowerCase().trim());

			if (response.endConversation) {
				conversations.delete(inputGoogleAction.conversationId);
			}

			this.send({
				conversationId: inputGoogleAction.conversationId,
				dialogState: {},
				payload: response.message,
				closeConversation: false
			});
		});
	}

	RED.nodes.registerType<MediaHelperNodeConfig>("media-helper", MediaHelperNode);
}
