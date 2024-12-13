function makeid(length) {
    const result = [];
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result.push(
            characters.charAt(Math.floor(Math.random() * charactersLength)),
        );
    }
    return result.join("");
}
const utils = {
    makeid,
};

export default utils;
