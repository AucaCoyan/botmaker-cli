export type ClientAction = {
	id: string,
	name: string,
	type: string;
	// codigo inicial para publicar
	publishedCode?: string
	unPublishedCode: string | null
	// filename sample.js
	filename: string
};

export type BMCFile = {
	token: string,
	cas: ClientAction[],
}

export type UserData = {
	FIRST_NAME: string
	LAST_NAME: string,
	variables: any
}

export type Context = {
	userData: UserData,
	params: any

}