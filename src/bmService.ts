import https from "./httpPromise.js";

const BASE_URL = "https://go.botmaker.com";

export async function getAllCas(token: string) {
	const headers = {
		Accept: "application/json",
		"Content-Type": "application/x-www-form-urlencoded",
		"access-token": token,
	};
	return await https(`${BASE_URL}/api/v1.0/clientAction`, { headers });
}

export async function getCa(token: string, caId: string) {
	const headers = {
		Accept: "application/json",
		"Content-Type": "application/x-www-form-urlencoded",
		"access-token": token,
	};
	return await https(`${BASE_URL}/api/v1.0/clientAction/${caId}`, { headers });
}

export async function createCa(token: string, newCa) {
	const headers = {
		Accept: "application/json",
		"Content-Type": "application/json",
		"access-token": token,
	};
	return await https(
		`${BASE_URL}/api/v1.0/clientAction/`,
		{ headers, method: "POST" },
		JSON.stringify(newCa),
	);
}

export async function updateCas(token: string, toUpdate) {
	const headers = {
		Accept: "application/json",
		"Content-Type": "application/json",
		"access-token": token,
	};
	return await https(
		`${BASE_URL}/api/v1.0/clientAction/multiple`,
		{ headers, method: "PUT" },
		JSON.stringify(toUpdate),
	);
}

export async function getCustomerContext(token: string, customerId = "rnd") {
	const headers = {
		"access-token": token,
	};
	return await https(`${BASE_URL}/api/v1.0/customer/${customerId}/context`, {
		headers,
	});
}

export async function publishCa(token: string, caId) {
	const headers = {
		Accept: "application/json",
		"access-token": token,
	};
	return await https(`${BASE_URL}/api/v1.0/clientAction/${caId}/publish`, {
		headers,
		method: "POST",
	});
}
