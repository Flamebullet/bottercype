module.exports = {
	name: 'submsg',
	description: 'add custom message to send in channel on subscriber event',
	async execute(channel, tags, message, client, sql, authProvider, followerchannels, TEclient) {
		// check for broadcaster/mod permission
		if (!(tags.badges && tags.badges.broadcaster == '1') && !tags.mod) {
			return client.say(channel, `@${tags.username}, Only channel broadcaster/mod has the permission to add subscriber event message.`);
		}
		if (
			((message.split(' ')[1].toLowerCase() == 'addsub' ||
				message.split(' ')[1].toLowerCase() == 'addresub' ||
				message.split(' ')[1].toLowerCase() == 'addgiftsub') &&
				message.split(' ').length < 3) ||
			((message.split(' ')[1].toLowerCase() == 'removesub' ||
				message.split(' ')[1].toLowerCase() == 'removeresub' ||
				message.split(' ')[1].toLowerCase() == 'removegiftsub') &&
				message.split(' ').length < 2)
		) {
			return client.say(channel, `@${tags.username}, failed to add/remove message due to lack of input.`);
		}

		let channelName = channel.substring(1);
		let action = message.split(' ')[1].toLowerCase();
		let output = message.split(' ').slice(2).join(' ');
		let type;

		if (action == 'addsub' || action == 'removesub') {
			type = 'sub';
		} else if (action == 'addresub' || action == 'removeresub') {
			type = 'resub';
		} else if (action == 'addgiftsub' || action == 'removegiftsub') {
			type = 'giftsub';
		} else {
			return client.say(channel, `@${tags.username}, failed to add/remove message, unknown action used.`);
		}

		let result = await sql`SELECT * FROM submsg WHERE username=${String(channelName)} AND type=${String(type)};`;
		if (result.length > 0) {
			if (action == 'addsub' || action == 'addresub' || action == 'addgiftsub') {
				return client.say(channel, `@${tags.username}, failed to add subscriber event, it already exist.`);
			} else if (action == 'removesub' || action == 'removeresub' || action == 'removegiftsub') {
				await sql`DELETE FROM submsg WHERE username=${String(channelName)} AND type=${String(type)};`;
				return client.say(channel, `@${tags.username}, subscriber event successfully removed.`);
			}
		} else {
			if (action == 'addsub' || action == 'addresub' || action == 'addgiftsub') {
				await sql`INSERT INTO submsg (username, message, type) VALUES (${String(channelName)}, ${String(output)}, ${String(type)});`;

				return client.say(channel, `@${tags.username}, subscriber event has been added successfully!`);
			} else if (action == 'removesub' || action == 'removeresub' || action == 'removegiftsub') {
				return client.say(
					channel,
					`@${tags.username}, unable to remove subscriber event as it does not exist, use the command \`!sub addsub|addresub|addgiftsub [message]\` to add a subscriber event message.`
				);
			}
		}
	}
};
