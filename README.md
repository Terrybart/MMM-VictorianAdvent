# MMM-VictorianAdvent
A Victorian themed Advent Calendar module for MagicMirror²

MMM-VictorianAdvent

A Victorian themed Advent Calendar module for MagicMirror2

Features
25 Advent doors
One new door unlocks each day throughout December
Configurable opening time
Unique festive image behind each door
Hidden "Patch the Elf" mini-game
Victorian Christmas village setting
Christmas Day finale behind Door XXV
Where's Patch?
Patch is a mischievous Christmas elf who moves to a different location every day.

Inspired by "Where's Wally?", the challenge is to spot Patch hidden somewhere within the Victorian village before opening the next Advent door.

Example Configuration

{
    disabled: false,
    module: "MMM-VictorianAdvent",
    position: "fullscreen_below",
    config: {
        calendarMonth: 12,
        openHour: 8,
        openMinute: 0,
        testMode: true,
        testIntervalSeconds: 20
    }
},

Advent Door Behaviour
One door becomes available each day from 1st December
Doors stay closed until the configured opening time
Each door reveals a unique festive image
Opened doors remain open throughout Advent
Door XXV contains the Christmas Day finale



