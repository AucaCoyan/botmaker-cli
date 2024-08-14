export type ClientAction = {
	id: string,
	name: string,
	type: string;
	// codigo inicial para publicar
	publishedCode?: string
	unPublishedCode: string
	// filename sample.js
	filename: string
};

export type BMCFile = {
	token: string,
	cas: ClientAction[],
}