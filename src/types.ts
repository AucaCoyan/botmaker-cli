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

export type ClientAction = {
    id: string;
    name: string;
    type: string;
    // codigo inicial para publicar
    publishedCode?: string;
    unPublishedCode: string | null;
    // filename sample.js
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
