const say = require('say');
const crypto = require('crypto');
const fs = require('fs');
const shell = require('shelljs');
const config = require('./config');

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
                    // guildConns.forEach((guildVoiceCon) => {
                    // TODO Still allow auto disconnect, even w/o force switch, if there's only empty channels
                    // });

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
                            console.error('[Voice]', '(Connection)', 'Connection error:', err);
                            this.leave(voiceChannel);
                        });

                        channelConnection.on('failed', (err) => {
                            console.error('[Voice]', '(Connection)', 'Connection failed:', err);
                            this.leave(voiceChannel);
                        });

                        setTimeout(() => {
                            this.sayOnConnection(connection, "Hello there friend. It's me, Timbot. Your favorite bud.");
                        }, 0);
                    })
                    .catch((err) => {
                        console.error('[Voice]', '(Channel)', 'Error in voice channel connection: ', err);
                        delete this.openConnections[channelId];

                        reject(err);
                        delete this.pendingConnections[channelId];
                    });
            } else {
                // Already connected
                resolve(channelConnection);
                delete this.pendingConnections[channelId];
            }
        });

        this.pendingConnections[channelId] = promise;

        return promise;
    }

    static leave(voiceChannel) {
        let channelId = voiceChannel.id.toString();
        let channelConnection = this.openConnections[channelId] || null;

        if (channelConnection) {
            try {
                channelConnection.disconnect();
            } catch (e) { }

            console.log('(Voice)', '(Channel)', 'Left channel:', channelId);
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
     */
    static say(voiceChannel, text) {
        // Join the channel or grab existing connection
        return this.join(voiceChannel)
            .then((connection) => {
                return this.sayOnConnection(connection, text);
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
     * @return {Promise<string>}
     */
    static sayOnConnection(connection, text) {
        // Render the TTS file
        return this.textToWav(text)
            .then((wavFileName) => {
                // TTS ok, do playback on connection
                connection.play(wavFileName);
            })
            .catch((err) => {
                // TTS error
                console.error('[Voice]', '(Say)', 'TTS rendering failed', err);
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

    static getConnectionsForGuild(guildId) {
        let connections = [];

        for (let channelKey in this.openConnections) {
            if (this.openConnections.hasOwnProperty(channelKey)) {
                let connection = this.openConnections[channelKey];

                if (connection && connection.channel.guild.id === guildId) {
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
            let speakCommand = `echo "${text}" | text2wave -o "${targetFileName}"`;

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

module.exports = Voice;