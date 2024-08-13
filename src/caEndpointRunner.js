import { createContext, runInNewContext } from "node:vm";
import chalk from "chalk";
import rp from "request-promise";
import fs from "node:fs";
import lodash from "lodash";
import moment from "moment";
import csv from "fast-csv";
import md5 from "md5";
import xml2js from "xml2js";
import secureRandom from "secure-random";
// import turf from "@turf/turf";
// import turfHelpers from "@turf/helpers";
import jwt from "jsonwebtoken";
// import { promisifyAll } from "bluebird";
import { google } from "googleapis";

function cloneGlobal() {
	return Object.defineProperties(
		{ ...global },
		Object.getOwnPropertyDescriptors(global),
	);
}

function ___runMain(bmContext, code, filename, helpers) {
	const context = Object.assign(cloneGlobal(), {
		...bmContext,
		request: bmContext.req,
		response: bmContext.res,
		rp,
		fs,
		lodash,
		moment,
		csv,
		md5,
		xml2js,
		secureRandom,
		turf,
		turfHelpers,
		jwt,
		bluebird,
		google,
		require,
	});

	const mainContext = Object.assign(context, {
		require: (packageName) => {
			if (packageName in helpers) {
				createContext(context);
				return runInNewContext(helpers[packageName].code, context, {
					filename: helpers[packageName].source,
				});
			}
			return require(packageName);
		},
	});

	createContext(mainContext);
	runInNewContext(code, mainContext, { filename, timeout: 90 * 60 * 1000 });
}

export default (req, res, token, code, helpers, filePath) => {
	const __redisLib__ = require("redis");
	promisifyAll(__redisLib__.RedisClient.prototype);
	promisifyAll(__redisLib__.Multi.prototype);

	const __parceStackTrace = (error) => {
		if (error.stack) {
			return __parceStackTrace(error.stack);
		}
		const message = error.split(/\r?\n/g)[0];
		const stack = [];
		const regex = /\s+at (.+?(?= \()) \((.+?)(?=[:\)]):?(\d*):?(\d*)\)/gm;
		let match;

		while ((match = regex.exec(error)) != null) {
			const [_, caller, source, line, column] = match;
			stack.push({ caller, source, line, column });
		}
		return {
			message,
			stack,
		};
	};
	try {
		const consoleColor = {
			log: chalk.green,
			warn: chalk.yellow,
			error: chalk.red,
		};
		const bmconsole = {};
		["log", "warn", "error"].forEach(
			(method) =>
				(bmconsole[method] = (...p) => {
					const { caller, line } =
						__parceStackTrace(new Error()).stack[1] || {};
					console[method](
						consoleColor[method](
							chalk.bold(`${caller === "eval" ? "main" : caller}:${line}~>`),
							...p,
						),
					);
				}),
		);

		const connectRedis = () => {
			const redis = __redisLib__.createClient(6379, "redis.botmaker.com", {
				password: token,
				socket_keepalive: false,
				retry_strategy: (options) => {
					if (options.attempt > 4) return undefined; // end reconnecting with built in error
					return options.attempt * 100; // reconnect after
				},
			});

			redis.on("error", (err) => {
				console.error(`Node-redis client error: ${err}`);
			});
			// redis.unref(); // allowing the program to exit once no more commands are pending
			return redis;
		};

		req.connectRedis = connectRedis;
		___runMain(
			{
				req,
				res,
				bmconsole,
			},
			code,
			filePath,
			helpers,
		);
	} catch (__executionErrors__) {
		console.error(__executionErrors__);
		res.status(500).send(JSON.stringify(__executionErrors__));
	}
};
