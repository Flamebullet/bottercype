module.exports = {
	name: 'quote',
	description: 'add a quote',
	async execute(channel, tags, message, client, sql, authProvider, followerchannels, TEclient) {
		function getRandomInt(max) {
			return Math.floor(Math.random() * max) + 1;
		}

		let channelName = channel.substring(1);
		let result = await sql`SELECT * FROM quotes WHERE username=${String(channelName)};`;

		if (message.split(' ').length >= 2 && message.split(' ')[1] == 'add') {
			// check for broadcaster/mod permission
			if (!(tags.badges && tags.badges.broadcaster == '1') && !tags.mod) {
				return client.say(channel, `@${tags.username}, Only channel broadcaster/mod has the permission to add quote.`);
			}
			// Check command syntax
			if (message.split(' ').length < 3) {
				return client.say(channel, `@${tags.username}, failed to add quote. Syntax: !quote add {quote}`);
			}

			// check number of quotes
			let quoteindex = result.length + 1;
			let quote = message.split(' ').slice(2).join(' ');
			await sql`INSERT INTO quotes (username, quoteindex, quote) VALUES (${String(channelName)}, ${quoteindex}, ${String(quote)});`;
			return client.say(channel, `@${tags.username}, new quote #${quoteindex} has been added successfully!`);
		} else {
			if (result.length <= 0) {
				return client.say(channel, `@${tags.username} There are no quotes available, start adding quotes with "!quote add"`);
			}
			if (message.split(' ').length >= 2 && Number.isInteger(parseInt(message.split(' ')[1]))) {
				if (parseInt(message.split(' ')[1]) <= result.length && parseInt(message.split(' ')[1]) > 0) {
					result = await sql`SELECT * FROM quotes WHERE username=${String(channelName)} AND quoteindex=${parseInt(message.split(' ')[1])};`;

					return client.say(channel, `@${tags.username}, Quote#${result[0].quoteindex}: ${result[0].quote}`);
				} else {
					return client.say(channel, `@${tags.username}, Quote number out of range, pick a quote number between 1 - ${result.length}`);
				}
			} else {
				const randInt = getRandomInt(result.length);

				result = await sql`SELECT * FROM quotes WHERE username=${String(channelName)} AND quoteindex=${randInt};`;

				return client.say(channel, `@${tags.username}, Quote#${result[0].quoteindex}: ${result[0].quote}`);
			}
		}
	}
};
