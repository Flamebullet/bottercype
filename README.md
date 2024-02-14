# Bottercype

A free Twitch bot to moderate and assist your Twitch moderators and community!

Head over to https://yt-dl.asuscomm.com/twitch-bot/bottercype to add the bot to your twitch channel, then perform !connect to accept the bot into the channel.

Modding the bot is highly recommended to ensure bot works perfectly, features that require bot's mod permission will be highlighted.

# Commands

-   [hello](#hello) - Test command
-   [connect](#connect) - Connect bot to channel
-   [disconnect](#disconnect) - Disconnect bot from channel
-   [so](#so) - Shoutout another channel
-   [followmsg](#followmsg) - Command to add a message for when a user followed the channel(Requires mod permission)

# Custom commands(Require broadcaster/mod permission)

-   [addcommand](#addcommand) - Add a custom command
-   [removecommand](#removecommand) - Remove a custom command
-   [addrandcommand](#addrandcommand) - Add a custom command that contains rng
-   [removerandcommand](#removerandcommand) - Remove a custom rng command
-   [addcountercommand](#addcountercommand) - Add a custom counter command
-   [removecountercommand](#removecountercommand) - Remove a custom counter command

## hello

Command to test availability/functionality of bot

**Usage:** `!hello`

## connect

Connect bot to channel

**Usage:** `!connect`

## disconnect

> !UMPORTANT! Disconnecting bot will also remove all the data such as custom commands and messages. Changes cannot be undone.

Disconnect bot from channel and remove all commands and messages previously added.

**Usage:** `!disconnect`

## so

Shoutout another channel, and used to setup `!so` command

#### To add a shoutout message

**Usage:**
`!so add [message]`

Variables:

-   {user} - Username of the channel getting the shoutout
-   {duration} - Duration of last stream
-   {game} - Last played game on last stream
-   {link} - URL to redirect to channel getting the shoutout

**Example:**
`!so add Check out {user} at {link} , they were last seen playing {game} for {duration}`

**Output when using !so @bottercype:**
Check out @Bottercype at https://twitch.tv/Bottercype , they were last seen playing Just Chatting for 1h1m34s

#### To remove a shoutout message

**Usage:**
`!so remove`

#### To shoutout a channel

**Usage:**
`!so @[user]` OR `!so [user]`
**Example:**
`!so @Bottercype` OR `!so bottecype`

## followmsg

> !IMPORTANT! Bot requires mod permission to perform this action

Setup a follow message for bot to repeat when a user follows your channel.

#### To add a follow message

**Usage:**
`!followmsg add [message]`

Variables:

-   {user} - Username of the channel getting the shoutout

**Example:**
`!followmsg add Welcome to the channel {user}`

**Output when a user follows the channel:**
Welcome to the channel @Bottercype

#### To remove the follow message

**Usage:**
`!followmsg remove`

## addcommand

Add a custom command to your channel. Common use case include plugging in socials with `!socials`.

**Usage:** `!addcommand [command] [message]`

**Example:**
`!addcommand socials Join my Discord here! https://discord.com`
**Output when using !socials:**
Join my Discord here! https://discord.com

## removecommand

Removes a custom command aded via `!addcommand` from channel.

**Usage:** `!removecommand [command]`

**Example:**
`!removecommand socials`

## addrandcommand

Add a custom command that contains a randomly generated number to your channel.

**Usage:**
`!addrandcommand [command] [min] [max] [message]`

Variables:

{user} - username of the user or mentioned user
{value} - a randomly generated number

**Example:**
`!addrandcommand cute 0 200 {user} is {value}% cute!`
**Output when using !cute:**
@bottercype is 69% cute!

## removerandcommand

Removes a custom rng command aded via `!addrandcommand` from channel.

**Usage:** `!removerandcommand [command]`

**Example:**
`!removerandcommand cute`

## addcountercommand

## removecountercommand
