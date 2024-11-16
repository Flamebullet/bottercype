const axios = require('axios');
const { twitchID } = require('../cred.js');

module.exports = {
	name: 'followage',
	description: "check user's follow age",
	async execute(channel, tags, message, client, sql, authProvider, followerchannels, TEclient) {
		let channelName = channel.substring(1);

		// command toggle stuff
		let isenabled = await sql`SELECT * FROM commandtoggles WHERE username=${String(channelName)} AND command='followage';`;
		if (isenabled.length == 0) {
			await sql`INSERT INTO commandtoggles (username, enable, command) VALUES (${String(channelName)}, ${Boolean(false)}, 'followage');`;
		}

		if (message.split(' ').length == 2 && message.split(' ')[1] == 'enable') {
			await sql`UPDATE commandtoggles SET enable=${Boolean(true)} WHERE username=${String(channelName)} AND command='followage';`;
		} else if (message.split(' ').length == 2 && message.split(' ')[1] == 'disable') {
			await sql`UPDATE commandtoggles SET enable=${Boolean(false)} WHERE username=${String(channelName)} AND command='followage';`;
		}

		if (isenabled.length == 0 || isenabled[0].enable == false) return;

		const userIdResult = await axios({
			method: 'get',
			url: `https://api.twitch.tv/helix/users?login=${tags.username}`,
			headers: {
				'Client-ID': twitchID,
				'Authorization': `Bearer ${await authProvider.getUserAccessToken()}`
			}
		});

		const userId = userIdResult.data.data[0]?.id;

		const broadcasterIdResult = await axios({
			method: 'get',
			url: `https://api.twitch.tv/helix/users?login=${channelName}`,
			headers: {
				'Client-ID': twitchID,
				'Authorization': `Bearer ${await authProvider.getUserAccessToken()}`
			}
		});

		const broadcasterId = broadcasterIdResult.data.data[0]?.id;

		const result = await axios({
			method: 'get',
			url: `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${broadcasterId}&user_id=${userId}`,
			headers: {
				'Client-ID': twitchID,
				'Authorization': `Bearer ${await authProvider.getUserAccessToken()}`
			}
		});

		if (result?.data.data[0] == undefined) return client.say(channel, `@${tags.username} is not following.`);
		const followAt = result.data.data[0]?.followed_at;

		function timeAgo(date) {
			const now = new Date();
			const nowUTC = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000);
			const elapsedMilliseconds = nowUTC - date;
			let elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);

			const intervals = [
				{ label: 'year', seconds: 31536000 },
				{ label: 'month', seconds: 2628000 },
				{ label: 'day', seconds: 86400 },
				{ label: 'hour', seconds: 3600 },
				{ label: 'minute', seconds: 60 },
				{ label: 'second', seconds: 1 }
			];

			const timeParts = intervals
				.map(({ label, seconds }) => {
					const count = Math.floor(elapsedSeconds / seconds);
					elapsedSeconds -= count * seconds;
					return count > 0 ? `${count} ${label}${count > 1 ? 's' : ''}` : '';
				})
				.filter((part) => part !== '')
				.join(' ');

			return timeParts;
		}

		const duration = timeAgo(new Date(followAt));

		return client.say(channel, `@${tags.username} has been following @${channelName} for ${duration}`);
	}
};
