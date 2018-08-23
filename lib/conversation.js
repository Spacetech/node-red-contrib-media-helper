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
const couchPotato_1 = require("./movies/couchPotato");
const yesMessages = ["yes", "yep", "yea", "please do", "make it so", "do it", "go"];
var ConversationState;
(function (ConversationState) {
    ConversationState[ConversationState["Idle"] = 0] = "Idle";
    ConversationState[ConversationState["Searching"] = 1] = "Searching";
})(ConversationState || (ConversationState = {}));
class Conversation {
    constructor(coachPotatoApiUrl) {
        this.state = {
            state: ConversationState.Idle
        };
        this.couchPotato = new couchPotato_1.default(coachPotatoApiUrl);
    }
    process(input) {
        return __awaiter(this, void 0, void 0, function* () {
            let response = {
                message: "Welcome to Media Helper!",
                endConversation: false
            };
            switch (this.state.state) {
                case ConversationState.Idle:
                    if (input.indexOf("download") === 0) {
                        const title = input.substring(8).trim();
                        try {
                            const movies = yield this.couchPotato.search(title);
                            if (movies.length === 0) {
                                response.message = "No movies found";
                                response.endConversation = true;
                            }
                            else {
                                const firstMovie = movies[0];
                                response.message = `Found ${movies.length} movies matching that title.\n`;
                                if (firstMovie.inLibrary) {
                                    response.message += `${firstMovie.title} (${firstMovie.year}) is already in your library.`;
                                }
                                else {
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
                        const success = yield this.couchPotato.download(this.state.selection.imdbId);
                        response.message = success ? "The movie download has been queued" : "Failed to queue movie download";
                    }
                    else {
                        response.message = "Canceled.";
                    }
                    response.endConversation = true;
                    this.resetState();
                    break;
            }
            return response;
        });
    }
    resetState() {
        this.state = {
            state: ConversationState.Idle
        };
    }
}
exports.default = Conversation;
//# sourceMappingURL=conversation.js.map