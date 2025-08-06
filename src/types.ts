export type subcommands_names =
    | "run"
    | "import"
    | "set-customer"
    | "status"
    | "diff"
    | "pull"
    | "new"
    | "push"
    | "publish"
    | "rename"
    | "help";

export const subcommand_list: subcommands_names[] = [
    "run",
    "import",
    "set-customer",
    "status",
    "diff",
    "pull",
    "new",
    "push",
    "publish",
    "rename",
    "help",
];

/**
 * Enum of the different types of the possible Client Actions
 */
type ClientActionTypes = "USER" | "ENDPOINT" | "SCHEDULE";

/**
 * The base type for the client actions to be used everywhere
 */
export type ClientAction = {
    /**
     * String identifying the ClientAction.
     * @example
     * ```
     * 8RIWUWSNUAFZH35GQMCK
     * ```
     */
    id: string;
    /**
     * Nombre que aparece en botmaker CAs (tiene caracteres not-path-able)
     */
    name: string;
    type: ClientActionTypes;
    /**
     * Codigo publicado (produccion)
     */
    publishedCode: string;
    /**
     * codigo sin publicar (con el punto rojo en botmaker)
     */
    unPublishedCode: string | null;
    /**
     * Filename sample.js
     * Esta no esta en la api `v1.0/clientAction
     */
    filename: string;
};

export type BMCFile = {
    token: string;
    cas: ClientAction[];
};

export type UserData = {
    FIRST_NAME: string;
    LAST_NAME: string;
    variables: Map<string, string>;
};

export type Context = {
    userData: UserData;
    params: Map<string, string>;
};

export type CodeAnHelpers = {
    code: string;
    helpers: object;
    filePath: string;
};

export type JWTBotmaker = {
    businessId: string;
    name: string;
    api: boolean;
    id: string;
    exp: number;
    jti: string;
};
