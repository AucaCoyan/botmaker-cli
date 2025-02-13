/**
 * Helper function that throws if runs.
 * @param _x variable that should have been catch
 */
export function assertCannotReach(_x: never) {
    throw new Error("cannot reach this place in the code");
}
