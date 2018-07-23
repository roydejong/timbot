# Voice

Timbot can join Voice channels, to synthesise bad jokes, run announcements and play stuff from YouTube.

This is probably not a good idea for any Discord that takes itself even remotely seriously so it is turned off by default.

Features and behavior when enabled:
- Will join users in voice channels and say Hi.
- Will TTS any replies it makes in text chat to users (if `voiced_replies` is enabled in config).
- Will announce when any configured channel goes live.
- Specific chat commands can make it play audio from YouTube, or cancel playback altogether.

## Setup

Voice is currently only tested and supported on Linux.

Timbot uses `text2wave` to synthesise text strings to speech. This is part of the `festival` text to speech engine.

Installation using apt-get is easy as it is available in default repositories on most distributions:

    sudo apt-get install festival
    
The default voice is `kal_diphone`. It's not a good voice, but it's bad in a fun way. If you want a "good" voice, you can install more advanced voices as well. But they're *too good* in my opinion. [See better voice instructions here](https://ubuntuforums.org/showthread.php?t=751169).

## Configuration

In `config.json`, set `voice_enabled` to true to enable voice behavior.

It is turned off by default.

## Chat commands

To use chat commands, mention `@Timbot` in your message or will be ignored in most cases. Timbot always ignores messages from other bots. 

### Play something from YouTube

Tag Timbot and include a YouTube video URL. The bot will join your voice channel and play the video as an audio stream.

You must be in a voice channel, and the URL must be complete with https:// prefix. Any previous playback will be stopped.

For example:

    @Timbot https://www.youtube.com/watch?v=ugW_eU5jgIM
 
### Shut up

Tag or mention Timbot and tell it to shut up. All playback will be stopped. For example, these all work:

    @Timbot shut up
    shut up Timbot
    timbot shutup
