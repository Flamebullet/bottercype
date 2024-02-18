module.exports = {
	name: 'hello',
	description: 'replies with world',
	async execute(channel, tags, message, client, sql, authProvider, followerchannels, TEclient) {
		return client.say(channel, `world`);
	}
};
