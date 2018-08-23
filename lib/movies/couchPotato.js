"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
class CouchPotato {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }
    search(title) {
        return new Promise((resolve, reject) => {
            request(`${this.apiUrl}/search/?q=${encodeURIComponent(title)}`, (error, response, body) => {
                const responseObject = JSON.parse(body);
                if (responseObject.success) {
                    resolve(responseObject.movies.map((movie) => {
                        return {
                            title: movie.original_title,
                            year: movie.year,
                            imdbId: movie.imdb,
                            inLibrary: movie.in_library !== false
                        };
                    }));
                }
                else {
                    reject("failure");
                }
            });
        });
    }
    download(imdbId) {
        return new Promise((resolve, reject) => {
            request.post(`${this.apiUrl}/movie.add/?identifier=${encodeURIComponent(imdbId)}`, (error, response, body) => {
                const responseObject = JSON.parse(body);
                if (responseObject.success) {
                    resolve(true);
                }
                else {
                    reject("failure");
                }
            });
        });
    }
}
exports.default = CouchPotato;
//# sourceMappingURL=couchPotato.js.map