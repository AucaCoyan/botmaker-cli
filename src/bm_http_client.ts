const BASE_URL = "https://go.botmaker.com";

/**
 * @param token
 * @param customerId
 * @returns if successful, returns `Context`
 */
export function getCustomerContext(token: string, customerId = "rnd") {
    return fetch(`${BASE_URL}/api/v1.0/customer/${customerId}/context`, {
        headers: {
            "access-token": token,
        },
    });
}

/**
 * Obtain all the client actions, both published and unpublished versions
 * of each.
 * @param token
 * @returns if successful, returns a list of `ClientAction`s
 */
export async function getAllCas(token: string): Promise<Response> {
    return await fetch(`${BASE_URL}/api/v1.0/clientAction`, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "access-token": token,
        },
    });
}

/**
 * @param token
 * @param newCa object with the CA parameters
 * @returns {Promise<Response>}
 */
export async function createCa(token: string, newCa: object) {
    return await fetch(`${BASE_URL}/api/v1.0/clientAction/`, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "access-token": token,
        },
        method: "POST",
        body: JSON.stringify(newCa),
    });
}
