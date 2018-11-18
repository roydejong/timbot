const Feature = require('./Base/Feature');
const Timbot = require('../Core/Timbot');
const Features = require('../Core/Features');
const ApiServer = require('../Admin/ApiServer');

/**
 * Manages the Discord bot's current activity / status.
 */
class ReactionManager extends Feature {
    constructor() {
        super();

        this._data = {};

        this._handleApiWriteReaction = this._handleApiWriteReaction.bind(this);
        this._handleApiReactionsFetch = this._handleApiReactionsFetch.bind(this);
    }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @inheritDoc
     */
    enable() {
        // Load all reactions from the database
        this.dbc = Timbot.db.connection;
        this.reloadAll();

        // Register API route: Handle reaction create/update via admin
        Timbot.api.registerApi(ReactionManager.API_OP_REACTION_WRITE, this._handleApiWriteReaction);
        Timbot.api.registerApi(ReactionManager.API_OP_REACTIONS_FETCH, this._handleApiReactionsFetch);
    }

    /**
     * @inheritDoc
     */
    disable() {

    }

    /**
     * @inheritDoc
     */
    handleEvent(eventName, data) {

    }

    // -----------------------------------------------------------------------------------------------------------------

    _handleApiWriteReaction(ws, data) {
        // Received a request to insert or update a reaction
        let id = parseInt(data.id) || null;

        let upsertData = {
            id: id,

            type: data.type || null,
            trigger: data.trigger || null,
            must_mention: parseInt(data.must_mention) === 1 ? 1 : 0,
            insensitive: parseInt(data.insensitive) === 1 ? 1 : 0,

            response: data.response || null,
            emote: data.emote || null,
            do_mention: parseInt(data.insensitive) === 1 ? 1 : 0
        };

        let result = Timbot.db.insertOrUpdate("reactions", upsertData);

        if (result === false) {
            return false;
        }

        let recordId = parseInt(result);

        if (!upsertData.id) {
            upsertData.id = recordId;
        }

        this._data[recordId] = upsertData;
    }

    _handleApiReactionsFetch(ws, data) {
        // Received a request to list all reactions
        let rows = Object.values(this._data);

        let payload = {
            op: ReactionManager.API_OP_REACTIONS_FETCH,
            reactions: rows
        };

        ws.send(JSON.stringify(payload));
    }

    // -----------------------------------------------------------------------------------------------------------------

    /**
     * (Re)loads all reactions from the database.
     */
    reloadAll() {
        try {
            let allRows = this.dbc.prepare('SELECT * FROM reactions;').all();
            Timbot.log.d(_("[Reactions] Loaded {0} reactions from database.", allRows.length));

            this._data = {};

            allRows.forEach((row) => {
                this._data[row.id] = row;
            });

            return true;
        } catch (e) {
            Timbot.log.e(_("[Reactions] Unable to load reactions from database: {0}", e.message));
            return false;
        }
    }
}

ReactionManager.API_OP_REACTION_WRITE = "reaction_write";
ReactionManager.API_OP_REACTIONS_FETCH = "reactions_fetch";

module.exports = ReactionManager;
