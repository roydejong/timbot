const say = require('say');
const crypto = require('crypto');
const fs = require('fs');
const shell = require('shelljs');
const config = require('./config');
const VoiceStatus = require('discord.js/src/util/Constants').VoiceStatus;
const ytdl = require('ytdl-core');

class Voice {
    /**
     * Joins a given VoiceChannel, if no connection is open to that channel yet.
     *
     * @param {VoiceChannel} voiceChannel
     */
    static join (voiceChannel, forceSwitch) {
        let channelId = voiceChannel.id.toString();
        let promise = this.pendingConnections[channelId] || null;

        if (promise) {
            // Already have a pending connection promise
            return promise;
        }

        promise = new Promise((resolve, reject) => {
            if (!config.voice_enabled) {
                reject(new Error("Voice is disabled in config"));
                delete this.pendingConnections[channelId];
                return;
            }

            let channelConnection = this.openConnections[channelId] || null;

            if (!channelConnection) {
                // Check if we're already connected to a channel in this guild
                let guildId = voiceChannel.guild.id;
                let guildConns = this.getConnectionsForGuild(guildId);

                if (guildConns.length > 0) {
                    if (!forceSwitch) {
                        reject("Force switch is off, and already have an open connection in this guild!");
                        delete this.pendingConnections[channelId];
                        return;
                    }

                    guildConns.forEach((guildVoiceCon) => {
                        console.log('[Voice]', '(Channel)', 'Leaving previous voice channel in same guild before joining voice channel');
                        this.leave(guildVoiceCon.channel);
                    });
                }

                voiceChannel.join()
                    .then((connection) => {
                        console.log('[Voice]', '(Channel)', 'Joined a voice channel: ', voiceChannel.toString());

                        channelConnection = connection;

                        this.openConnections[channelId] = channelConnection;

                        resolve(channelConnection);
                        delete this.pendingConnections[channelId];

                        channelConnection.on('error', (err) => {
                            if (!!this.openConnections[channelId]) {
                                console.error('[Voice]', '(Connection)', 'Connection error:', err);
                                this.leave(voiceChannel);
                            }
                        });

                        channelConnection.on('failed', (err) => {
                            if (!!this.openConnections[channelId]) {
                                console.error('[Voice]', '(Connection)', 'Connection failed:', err);
                                this.leave(voiceChannel);
                            }
                        });

                        channelConnection.on('disconnect', () => {
                            if (!!this.openConnections[channelId]) {
                                console.warn('[Voice]', '(Connection)', 'Connection disconnect event received.');
                                this.leave(voiceChannel);
                            }
                        });

                        try {
                            this.sayOnConnection(channelConnection, "Oh.");
                        } catch (e) {
                            console.error('[Voice]', '(Greeter)', 'Failed to run channel greeter [1]:', e);
                        }

                        setTimeout(() => {
                            this.greetChannel(voiceChannel);
                        }, 2500);
                    })
                    .catch((err) => {
                        console.error('[Voice]', '(Channel)', 'Error in voice channel connection: ', err);
                        this.leave(voiceChannel);
                        reject(err);
                    });
            } else {
                // Already connected
                resolve(channelConnection);
                delete this.pendingConnections[channelId];

                // Check to make sure channel hasn't disconnected (failsafe)
                this.checkConnectionStatus(channelConnection);
            }
        });

        this.pendingConnections[channelId] = promise;

        return promise;
    }

    /**
     * Checks the status of a voice connection object, cleaning up the connection if it has closed.
     * This is a failsafe handler, and should generally not do anything unless we did not handle a status change or error.
     *
     * @param {VoiceConnection} voiceConnection
     * @return {boolean} Returns true if connection does not look to be dead.
     */
    static checkConnectionStatus(voiceConnection) {
        if (voiceConnection) {
            if (voiceConnection.status === VoiceStatus.DISCONNECTED) {
                console.warn('[Voice]', '(Connection)', 'A voice connection has been disconnected (failsafe detection), now leaving channel.');
                this.leave(voiceConnection.channel);
                return false;
            }
        }

        return true;
    }

    /**
     * Greets the peeps in a channel.
     *
     * @param {VoiceChannel} voiceChannel
     */
    static greetChannel(voiceChannel) {
        let channelId = voiceChannel.id.toString();
        let channelConnection = this.openConnections[channelId] || null;

        if (!channelConnection) {
            return;
        }

        let peopleText = "friend";
        let memberNames = [];

        voiceChannel.members.forEach((member) => {
            if (member.user.username.toLowerCase() === "timbot") {
                // Let's not greet ourselves
                return;
            }

            memberNames.push(member.user.username.spacifyCamels());
        });

        if (memberNames.length > 0) {
            peopleText = memberNames.joinEnglishList();
        }

        let greetingMsg = `Hello there ${peopleText}. It's me, Timbot. Your favorite bud.`;

        try {
            this.sayOnConnection(channelConnection, greetingMsg);
        } catch (e) {
            console.error('[Voice]', '(Greeter)', 'Failed to run channel greeter [2]:', e);
        }
    }

    /**
     * Leaves a channel if possible, causing any connections to close.
     * Ensures the state is clean so a new connection can be established.
     *
     * @param {VoiceChannel} voiceChannel
     */
    static leave(voiceChannel) {
        let channelId = voiceChannel.id.toString();
        let channelConnection = this.openConnections[channelId] || null;

        if (channelConnection) {
            if (channelConnection.status !== VoiceStatus.DISCONNECTED) {
                try {
                    channelConnection.disconnect();
                } catch (e) {
                }

                console.log('(Voice)', '(Channel)', 'Leaving channel:', channelId);
            }
        }

        delete this.openConnections[channelId];
        delete this.pendingConnections[channelId];
    }

    /**
     * Handles a channel update event.
     *
     * @param {VoiceChannel} voiceChannel
     */
    static handleChannelStateUpdate(voiceChannel) {
        let channelId = voiceChannel.id.toString();
        let pendingTimeout = this.channelCheckTimeouts[channelId];

        if (pendingTimeout) {
            clearTimeout(pendingTimeout);
            delete this.channelCheckTimeouts[channelId];
        }

        this.channelCheckTimeouts[channelId] = setTimeout(() => {
            let channelId = voiceChannel.id.toString();
            let channelConnection = this.openConnections[channelId] || null;

            let hasOpenConnection = !!channelConnection;
            let channelIsEmpty = (voiceChannel.members.size === 0);

            if (!hasOpenConnection && !channelIsEmpty) {
                // We need to join, someone is there
                this.join(voiceChannel, false);
            } else if (hasOpenConnection && voiceChannel.members.size <= 1) {
                // It's just us :-(
                console.log('(Voice)', 'Leaving empty channel:', channelId);
                this.leave(voiceChannel);
            }
        }, 1000);
    }

    /**
     * Combined helper function: Says something in a voice channel via TTS.
     *
     * @param {VoiceChannel} voiceChannel
     * @param {string} text
     * @param {boolean} important If true, stop playback of any other sound.
     */
    static say(voiceChannel, text, important) {
        // Join the channel or grab existing connection
        return this.join(voiceChannel)
            .then((connection) => {
                return this.sayOnConnection(connection, text, important);
            })
            .catch((err) => {
                // Connect error
                console.error('[Voice]', '(Say)', 'Voice connection problem', err);
            });
    }

    /**
     * Helper function: Say something in a voice channel via TTS.
     *
     * @param {VoiceConnection} connection
     * @param {string} text
     * @param {boolean} important If true, stop playback of any other sound.
     * @return {Promise<string>}
     */
    static sayOnConnection(connection, text, important) {
        // Render the TTS file
        return this.textToWav(text)
            .then((wavFileName) => {
                // TTS ok, do playback on connection
                if (important || !connection.dispatcher || connection.dispatcher.paused ||
                    connection.dispatcher.destroyed || (connection.dispatcher._writableState && connection.dispatcher._writableState.ended)) {
                    connection.play(wavFileName);
                }
            })
            .catch((err) => {
                // TTS error
                console.error('[Voice]', '(Say)', 'TTS rendering failed', err);
            });
    }

    /**
     * Combined helper function: Play a supported stream URL on a voice connection.
     *
     * @param {VoiceChannel} voiceChannel
     * @param {string} url
     */
    static playYoutubeUrl(voiceChannel, url) {
        // Join the channel or grab existing connection
        return new Promise((resolve, reject) => {
            return this.join(voiceChannel, true)
                .then((connection) => {
                    this.playYoutubeAudioStreamOnConnection(connection, url)
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            console.error('[Voice]', '(PlayUrl)', 'Stream problem', err);
                            reject(err);
                        });
                })
                .catch((err) => {
                    // Connect error
                    console.error('[Voice]', '(PlayUrl)', 'Voice connection problem', err);
                    reject(err);
                });
        });
    }

    /**
     * Attempts to stop any previous playback.
     *
     * @param {VoiceChannel} voiceChannel
     */
    static shutUp(voiceChannel) {
        let channelId = voiceChannel.id.toString();
        let channelConnection = this.openConnections[channelId] || null;

        if (channelConnection && channelConnection.dispatcher) {
            try {
                channelConnection.dispatcher.end();
            } catch (e) { }
        }
    }

    /**
     * Helper function: Play YouTube audio stream via ytdl.
     *
     * @param {VoiceConnection} connection
     * @param {string} youtubeUrl
     * @return {Promise<string>}
     */
    static playYoutubeAudioStreamOnConnection(connection, youtubeUrl) {
        return new Promise((resolve, reject) => {
            try {
                const streamOptions = {seek: 0, volume: 1};
                let stream = ytdl(youtubeUrl, {filter: 'audioonly'});
                let dispatcher = connection.play(stream, streamOptions);
                resolve(dispatcher);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Helper function: Say something on every connection.
     *
     * @param {string} text
     */
    static sayEverywhere(text) {
        // Pre render TTS so it only happens once
        return this.textToWav(text)
            .then(() => {
                // TTS ok, do playback broadcast
                // TODO Use VoiceBroadcaster utility for better perf
                for (let channelKey in this.openConnections) {
                    if (this.openConnections.hasOwnProperty(channelKey)) {
                        let connection = this.openConnections[channelKey];

                        if (connection) {
                            try {
                                this.sayOnConnection(connection, text);
                            } catch (e) { }
                        }
                    }
                }
            })
            .catch((err) => {
                // TTS error
                console.error('[Voice]', '(Say)', 'TTS rendering failed', err);
            });
    }

    /**
     * Attempts to list all voice connections for a certain guild.
     * Because we can only have one voice connection per guild, this should really only list one or zero connections.
     *
     * @param guildId
     * @return {Array<VoiceConnection>}
     */
    static getConnectionsForGuild(guildId) {
        let connections = [];

        for (let channelKey in this.openConnections) {
            if (this.openConnections.hasOwnProperty(channelKey)) {
                let connection = this.openConnections[channelKey];

                if (connection && this.checkConnectionStatus(connection) && connection.channel.guild.id === guildId) {
                    connections.push(guildId);
                }
            }
        }

        return connections;
    }

    /**
     * Renders text using the TTS engine and writes it out to a WAV file.
     * Returns a promise that will resolve with the WAV filename, or reject if TTS rendering fails for whatever reason.
     *
     * @param {string} text The raw text to render to speech.
     * @return {Promise<string>} Promise, resolves on TTS success with generated WAV filename.
     */
    static textToWav(text) {
        return new Promise((resolve, reject) => {
            // Determine target file, and see if we already have this TTS pre-rendered maybe
            let targetFileName = '/tmp/timbot_tts_' + crypto.createHash('md5').update(text).digest('hex') + '.wav';

            if (fs.existsSync(targetFileName)) {
                console.log('[Voice]', '(TTS)', 'Using pre-rendered TTS from filesystem ', targetFileName, `"${text}"`);
                resolve(targetFileName);
                return;
            }

            console.log('[Voice]', '(TTS)', 'Rendering new TTS: ', targetFileName, `"${text}"`);

            // Clean text for use in the echo command
            text = text.replaceAll(`"`, `\\"`);

            // Execute shell command to generate the file
            let speakCommand = `echo "${text}" | text2wave -o "${targetFileName}" -eval "(voice_rab_diphone)"`;

            shell.exec(speakCommand, { async: true, silent: false }, (code, stdout, stderr) => {
                if (code === 0) {
                    resolve(targetFileName);
                } else {
                    reject(stderr);
                }
            });
        });
    }
}

Voice.openConnections = { };
Voice.pendingConnections = { };
Voice.channelCheckTimeouts = { };
Voice.channelLastDispatcher = { };

module.exports = Voice;