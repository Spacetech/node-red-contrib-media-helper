
export interface IMovieProvider {
	search(title: string): Promise<IMovie[]>;
	download(imdbId: string): Promise<boolean>;
}

export interface IMovie {
	title: string;
	year: number;
	imdbId: string;
	inLibrary: boolean;
}
