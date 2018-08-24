
export interface ICustomAction {
	name: string;
	phrases: string[];
}

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

export interface IIntents {
	match: (text: string) => Promise<IIntentMatches>;
}

export interface IIntentMatches {
	best: IIntentMatch;
}

export interface IIntentMatch {
	intent: string;
	values: string[];
}
