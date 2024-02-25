module.exports = {
	name: 'help',
	description: 'Outputs url to command guide page',
	async execute(channel, tags, message, client, sql, authProvider, followerchannels, TEclient) {
		return client.say(channel, `For help on setting up bot and using the commands, check out https://yt-dl.asuscomm.com/twitch-bot/bottercype`);
	}
};
