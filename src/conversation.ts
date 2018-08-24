import CouchPotato from "./movies/couchPotato";
import * as common from "./common";

const yesMessages = ["yes", "yep", "yea", "please do", "make it so", "do it", "go"];

enum ConversationState {
	Idle,
	Searching
}

interface IConversationState {
	state: ConversationState;
}

interface IIdleConversationState extends IConversationState {
	state: ConversationState.Idle;
}

interface ISearchingConversationState extends IConversationState {
	state: ConversationState.Searching;
	movies: common.IMovie[];
	selection: common.IMovie;
}

type ConversationStateType = IIdleConversationState | ISearchingConversationState;

export interface IConversationResponse {
	message: string | undefined;
	endConversation: boolean;
}

export default class Conversation {

	private state: ConversationStateType = {
		state: ConversationState.Idle
	};

	private couchPotato: CouchPotato;

	constructor(coachPotatoApiUrl: string) {
		this.couchPotato = new CouchPotato(coachPotatoApiUrl);
	}

	public async process(input: string): Promise<IConversationResponse> {
		let response: IConversationResponse = {
			message: undefined,
			endConversation: false
		};

		switch (this.state.state) {

			case ConversationState.Idle:
				if (input.indexOf("download") === 0) {
					const title = input.substring(8).trim();

					try {
						const movies = await this.couchPotato.search(title);

						if (movies.length === 0) {
							response.message = "No movies found";
							response.endConversation = true;

						} else {
							const firstMovie = movies[0];

							response.message = `Found ${movies.length} movies matching that title.\n`;

							if (firstMovie.inLibrary) {
								response.message += `${firstMovie.title} (${firstMovie.year}) is already in your library.`;
								response.endConversation = true;

							} else {
								response.message += `Do you want to download ${firstMovie.title} (${firstMovie.year})?`;
							}

							this.state = {
								state: ConversationState.Searching,
								movies: movies,
								selection: firstMovie
							};
						}
					}
					catch (ex) {
						response.message = "An error occured while trying to search.";
						response.endConversation = true;
					}
				}

				break;

			case ConversationState.Searching:
				let yes = false;

				for (const yesMessage of yesMessages) {
					if (input.indexOf(yesMessage) !== -1) {
						yes = true;
						break;
					}
				}

				if (yes) {
					const success = await this.couchPotato.download(this.state.selection.imdbId);

					response.message = success ? "The movie download has been queued" : "Failed to queue movie download";

				} else {
					response.message = "Canceled.";
				}

				response.endConversation = true;

				this.resetState();

				break;
		}

		return response;
	}

	private resetState() {
		this.state = {
			state: ConversationState.Idle
		};
	}
}
