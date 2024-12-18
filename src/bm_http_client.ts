const BASE_URL = "https://go.botmaker.com";

export function getCustomerContext(token: string, customerId = "rnd") {
    return fetch(`${BASE_URL}/api/v1.0/customer/${customerId}/context`, {
        headers: {
            "access-token": token,
        },
    });
}
export async function getAllCas(token: string) {
    return await fetch(`${BASE_URL}/api/v1.0/clientAction`, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
            "access-token": token,
        },
    });
}
