import * as nodered from "node-red";
// todo: add typings for these
// @ts-ignore
import * as ecolect from "ecolect";
// @ts-ignore
import * as en from "ecolect/language/en";
// @ts-ignore
import * as any from "ecolect/values/any";

import Conversation from "./conversation";
import * as common from "./common";

interface MediaHelperNodeConfig extends nodered.NodeProperties {
	coachPotatoApiUrl: string;
	customActions: common.ICustomAction[];
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

function setupEcolet(customActions: common.ICustomAction[]): common.IIntents {
	let intents = ecolect.intents(en);

	for (const customAction of customActions) {
		let intent = intents.intent(customAction.name);

		const intentValues: string[] = [];

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

module.exports = (RED: nodered.Red) => {
	function MediaHelperNode(config: MediaHelperNodeConfig) {
		RED.nodes.createNode(this, config);

		const coachPotatoApiUrl = config.coachPotatoApiUrl;

		const intents = setupEcolet(config.customActions);

		this.on("input", async (inputGoogleAction: IGoogleAction) => {
			let conversation = conversations.get(inputGoogleAction.conversationId);
			if (conversation === undefined) {
				conversation = new Conversation(coachPotatoApiUrl);
				conversations.set(inputGoogleAction.conversationId, conversation);
			}

			const input = inputGoogleAction.payload.toLocaleLowerCase().trim();

			const response = await conversation.process(input);
			if (response.endConversation) {
				conversations.delete(inputGoogleAction.conversationId);
			}

			const messages = new Array(1 + config.customActions.length);

			if (response.message === undefined) {
				const intent = await intents.match(input);
				if (intent.best) {
					messages[0] = {
						conversationId: inputGoogleAction.conversationId,
						dialogState: {},
						payload: intent.best,
						closeConversation: false
					};

				} else {
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
		});
	}

	RED.nodes.registerType<MediaHelperNodeConfig>("media-helper", MediaHelperNode);
}
