# Bottercype

A free Twitch bot to moderate and assist your Twitch moderators and community!

Head over to https://yt-dl.asuscomm.com/twitch-bot/bottercype to add the bot to your twitch channel, then perform !connect to accept the bot into the channel.

Modding the bot is highly recommended to ensure bot works perfectly, features that require bot's mod permission includes:

-   followmsg - Bot requires mod permission to listen to `Follow` event due to Twitch's new api changes

# Commands

-   [hello](#hello) - Test command
-   [connect](#connect) - Connect bot to channel **(Requires mod permission)**
-   [disconnect](#disconnect) - Disconnect bot from channel **(Requires mod permission)**
-   [so](#so) - Shoutout another channel **(Requires mod permission)**
-   [followmsg](#followmsg) - Command to add a custom message for user follow event **(Requires mod permission)** **(Bot Requires Mod permission)**
-   [submsg](#submsg) - Command to add a custom message for subscription events **(Requires mod permission)**

# Custom commands

**Adding and removing custom commands require mod permission, using the custom command does not require mod**

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

> IMPORTANT! Disconnecting bot will also remove all the data such as custom commands and messages. Changes cannot be undone.

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
`!so @Bottercype` OR `!so bottercype`

## followmsg

> IMPORTANT! Bot requires mod permission to perform this action

Setup a custom message that triggers when a user follows your channel.

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

## submsg

Setup a subscription message that triggers when a user subscribes, resubscribes or gift subscriptions to your channel.

#### To add a standard sub message(Does not include resub/gifted subs)

**Usage:**
`!submsg addsub [message]`

Variables:

-   {user} - Username of the subscriber
-   {tier} - Tier level of the subscription

**Example:**
`!submsg addmsg Thank you {user} for the tier {tier} sub`

**Output when a user subscribes the channel:**
Thank you @Bottercype for the tier 3 sub

#### To remove the standard sub message

**Usage:**
`!submsg removesub`

---

#### To add a resub message

**Usage:**
`!submsg addresub [message]`

Variables:

-   {user} - Username of the subscriber
-   {duration} - Duration of subscription
-   {tier} - Tier level of the subscription

**Example:**
`!submsg addresub Thank you {user} for the {duration} of {tier} resub`

**Output when a user resubs the channel:**
Thank you @Bottercype for the 69 months of tier 3 resub

#### To remove the resub message

**Usage:**
`!submsg removeresub`

---

#### To add a gift sub message

**Usage:**
`!submsg addgiftsub [message]`

Variables:

-   {user} - Username of the sub gifter
-   {subcount} - Number of subs given
-   {tier} - Tier level of the subscription
-   {totalcount} - Total subs given in the channel

**Example:**
`!submsg addgiftsub Thank you {user} for the {subcount} {tier} gifted subs, they have given a total of {totalcount} subs to the community!`

**Output when a user gift 69 subs to the channel:**
Thank you @Bottercype for the 69 tier 1 gifted subs, they have given a total of 420 subs to the community!

#### To remove the gift sub message

**Usage:**
`!submsg removegiftsub`

## bitmsg

Setup a custom message that triggers when a user sends bits your channel.

#### To add a bit message

**Usage:**
`!bitmsg add [message]`

Variables:

-   {user} - Username of the channel getting the shoutout
-   {bits} - Amount of bits cheered

**Example:**
`!bitmsg add Thank you {user} for the {bits}bits`

**Output when a user cheer 100bits to the channel:**
Thank you @Bottercype for the 100bits

#### To remove the bit message

**Usage:**
`!bitmsg remove`

## addcommand

Add a custom command to your channel. Common use case include plugging in socials with `!socials` or `!lurk`.

**Usage:** `!addcommand [command] [message]`

Variables:

-   {user} - username of the user or mentioned user

**Example:**
`!addcommand lurk {user} has gone into hiding!`
**Output when using !lurk:**
@Bottercype has gone into hiding!

## removecommand

Removes a custom command aded via `!addcommand` from channel.

**Usage:** `!removecommand [command]`

**Example:**
`!removecommand lurk`

## addrandcommand

Add a custom command that contains a randomly generated number to your channel.

**Usage:**
`!addrandcommand [command] [min] [max] [message]`

Variables:

-   {user} - username of the user or mentioned user
-   {value} - a randomly generated number

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
