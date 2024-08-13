import chalk from "chalk";
const reset = chalk.reset;
const green = chalk.green;
const black = chalk.black;
const cyan = chalk.cyan;
const bgGreen = chalk.bgGreen;
const grey = chalk.gray;
const blue = chalk.blue;
const whiteBright = chalk.whiteBright;

const newLine = /\r?\n/g;
const spaces = /\s+/g;

function breakLines(text, max) {
	if (text.length < max) {
		return [text];
	}
	const breakpoints = [...text.matchAll(spaces)].filter(
		(m) => m.index > 0 && m.index < max,
	);
	if (breakpoints.length === 0) {
		return [text.substr(0, max), ...breakLines(text.substr(max), max)];
	}
	const breakpoint = breakpoints[breakpoints.length - 1];
	return [
		text.substr(0, breakpoint.index),
		...breakLines(text.substr(breakpoint.length + breakpoint.index), max),
	];
}

const defaultBorders = ["╭", "╮", "∠", "╯", "│", "─"];
const doubleBorders = ["╔", "╗", "╚", "╝", "║", "═"];
const boxedBorders = ["┌", "┐", "└", "┘", "│", "─"];
const dashedBorder = ["┌", "┐", "└", "┘", "╎", "╌"];
const emptyBorders = [" ", " ", " ", " ", " ", " "];

const alignLeft = (text, total) =>
	" " + text + " ".repeat(total - text.length + 1);
const center = (text, total) =>
	" " +
	" ".repeat(Math.floor((total - text.length) / 2)) +
	text +
	" ".repeat(Math.ceil((total - text.length) / 2)) +
	" ";

const chatBubble = (
	text = "",
	{
		maxWidth = 60,
		borders = defaultBorders,
		aling = alignLeft,
		minWidth = 0,
		borderColor = reset,
		textColor = reset,
	} = {},
) => {
	const [tl, tr, bl, br, v, h] = borders;
	const lines = text
		.toString()
		.substr(0, 5000)
		.split(newLine)
		.reduce((acc, line) => [...acc, ...breakLines(line, maxWidth)], []);
	const maxSize = Math.max(
		minWidth,
		lines.reduce((max, l) => (l.length > max ? l.length : max), 0) + 4,
	);
	const top = tl + h.repeat(maxSize - 2) + tr;
	const bottom = bl + h.repeat(maxSize - 2) + br;
	const linesPadding = lines.map(
		(l) =>
			`${borderColor(v)}${textColor(aling(l, maxSize - 4))}${borderColor(v)}`,
	);
	return [borderColor(top), ...linesPadding, borderColor(bottom)].join("\n");
};

const renderLiterals = (text) => chatBubble(text, { borderColor: green });

const sayIcons = {
	Image: "🌻",
	Audio: "🎧",
	File: "📁",
	Video: "🎥",
};

const renderUrl = (url, type) =>
	chatBubble(`${sayIcons[type]}\n${type}`, {
		maxWidth: 30,
		borders: emptyBorders,
		aling: center,
		minWidth: 15,
		textColor: black.bgWhiteBright,
		borderColor: black.bgWhiteBright,
	}) +
	"\n" +
	cyan.bold.italic.underline(url) +
	"\n";

const optionIcons = {
	url: "🔗",
	location: "📍",
	element_share: "💡",
	phone_number: "📞",
	postback: "🤖",
};

const renderButtons = (message, options) =>
	chatBubble(
		(message ? message + "\n\n" : "") +
			options.map((o) => `[${optionIcons[o.itemType]} ${o.value}]`).join("\n"),
		{
			borderColor: cyan,
			borders: boxedBorders,
		},
	);

const renderSay = (say) =>
	say
		.map(
			({
				AUDIOS_URLS = [],
				FILES_URLS = [],
				IMAGES_URLS = [],
				VIDEOS_URLS = [],
				literals = [],
				MESSAGE = null,
				OPTIONS = [],
			}) => [
				...literals.map(renderLiterals),
				...(MESSAGE ? [renderButtons(MESSAGE, OPTIONS)] : []),
				...AUDIOS_URLS.map((url) => renderUrl(url, "Audio")),
				...FILES_URLS.map((url) => renderUrl(url, "File")),
				...IMAGES_URLS.map((url) => renderUrl(url, "Image")),
				...VIDEOS_URLS.map((url) => renderUrl(url, "Video")),
			],
		)
		.join("\n");

const renderGoToRule = (ruleName) =>
	!ruleName
		? ""
		: "\n\n" +
			chatBubble(`🤖  go to rule '${ruleName}'`, {
				borders: dashedBorder,
				borderColor: bgGreen,
				textColor: bgGreen.black,
			});

function renderChangeVars(newVars, currentVars) {
	const keys = Object.keys(newVars);
	if (keys.length === 0) return "";
	const changes = keys
		.map((varname) => {
			const oldValue = currentVars[varname];
			const newValue = newVars[varname];
			if (oldValue === newValue) return "";
			const oldValueStr =
				oldValue == null
					? grey.italic.strikethrough("null")
					: grey.italic(JSON.stringify(oldValue.substr(0, 20)));
			const newValueStr =
				newValue == null
					? blue.italic("null")
					: green(JSON.stringify(newValue.substr(0, 60)));
			return (
				whiteBright(`$\{${varname}\} = `) +
				oldValueStr +
				cyan(" ➡️ ") +
				newValueStr
			);
		})
		.filter(Boolean)
		.join("\n");

	return "\n" + changes;
}

function resolveRenderer({ user, say, gotoRuleName }, context) {
	return (
		renderSay(say) +
		renderGoToRule(gotoRuleName) +
		renderChangeVars(user, context.userData.variables)
	);
}

export default resolveRenderer;
