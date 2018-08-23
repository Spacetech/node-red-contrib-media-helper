import * as request from "request";

import * as common from "../common";

export default class CouchPotato implements common.IMovieProvider {

	constructor(private apiUrl: string) {
	}

	public search(title: string) {
		return new Promise<common.IMovie[]>((resolve, reject) => {
			request(`${this.apiUrl}/search/?q=${encodeURIComponent(title)}`, (error, response, body) => {
				const responseObject = JSON.parse(body);
				if (responseObject.success) {
					resolve(responseObject.movies.map((movie: any) => {
						return {
							title: movie.original_title,
							year: movie.year,
							imdbId: movie.imdb,
							inLibrary: movie.in_library !== false
						};
					}));

				} else {
					reject("failure");
				}
			});
		});
	}

	public download(imdbId: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			request.post(`${this.apiUrl}/movie.add/?identifier=${encodeURIComponent(imdbId)}`, (error, response, body) => {
				const responseObject = JSON.parse(body);
				if (responseObject.success) {
					resolve(true);

				} else {
					reject("failure");
				}
			});
		});
	}
}