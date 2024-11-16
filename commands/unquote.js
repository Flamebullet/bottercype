module.exports = {
	name: 'unquote',
	description: 'remove a quote',
	async execute(channel, tags, message, client, sql, authProvider, followerchannels, TEclient) {
		let channelName = channel.substring(1);

		// command toggle stuff
		let isenabled = await sql`SELECT * FROM commandtoggles WHERE username=${String(channelName)} AND command='quote';`;
		if (isenabled.length == 0) {
			await sql`INSERT INTO commandtoggles (username, enable, command) VALUES (${String(channelName)}, ${Boolean(false)}, 'quote');`;
		}

		if (message.split(' ').length == 2 && message.split(' ')[1] == 'enable') {
			await sql`UPDATE commandtoggles SET enable=${Boolean(true)} WHERE username=${String(channelName)} AND command='quote';`;
		} else if (message.split(' ').length == 2 && message.split(' ')[1] == 'disable') {
			await sql`UPDATE commandtoggles SET enable=${Boolean(false)} WHERE username=${String(channelName)} AND command='quote';`;
		}

		if (isenabled.length == 0 || isenabled[0].enable == false) return;

		let result = await sql`SELECT * FROM quotes WHERE username=${String(channelName)};`;
		if (message.split(' ').length == 2 && Number.isInteger(parseInt(message.split(' ')[1]))) {
			// check for broadcaster/mod permission
			if (!(tags.badges && tags.badges.broadcaster == '1') && !tags.mod) {
				return client.say(channel, `@${tags.username}, Only channel broadcaster/mod has the permission to add quote.`);
			}
			if (parseInt(message.split(' ')[1]) <= result.length && parseInt(message.split(' ')[1]) > 0) {
				await sql`DELETE FROM quotes WHERE username=${String(channelName)} AND quoteindex=${parseInt(message.split(' ')[1])};`;
				await sql`UPDATE quotes SET quoteindex=quoteindex-1 WHERE username=${String(channelName)} AND quoteindex>${parseInt(message.split(' ')[1])};`;

				return client.say(channel, `@${tags.username}, quote #${parseInt(message.split(' ')[1])} has been removed successfully!`);
			} else {
				return client.say(channel, `@${tags.username}, Quote number out of range, pick a quote number between 1 - ${result.length}`);
			}
		} else {
			return client.say(channel, `@${tags.username}, failed to remove quote(Invalid syntax). Syntax: !unquote {quote number}`);
		}
	}
};
