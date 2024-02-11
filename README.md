# Bottercype

A Twitch bot project

Head over to https://yt-dl.asuscomm.com/twitch-bot/bottercype to add the bot to your twitch channel

# Commands

-   [hello](#hello) - Test command
-   [connect](#connect) - Connect bot to channel
-   [disconnect](#disconnect) - Disconnect bot from channel

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

Disconnect bot from channel

**Usage:** `!disconnect`

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
{user} - denotes where in the output the user will be mentioned
{value} - denotes where in the output the value will be used

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
