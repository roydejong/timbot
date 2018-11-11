const Gettext = require('node-gettext');
const fs = require('fs');
const path = require('path');
const po = require('gettext-parser').po;

/**
 * Language / Gettext helper for Timbot.
 */
class Lang {
    /**
     * Initializes Gettext and loads all supported translations.
     */
    constructor() {
        this.gt = new Gettext();

        Lang.SUPPORTED_LOCALES.forEach((locale) => {
            try {
                const fileName = `${Lang.DOMAIN}.po`;
                const translationsFilePath = path.join(Lang.TRANSLATIONS_DIR, locale, fileName);

                const translationsContent = fs.readFileSync(translationsFilePath);

                const parsedTranslations = po.parse(translationsContent);
                this.gt.addTranslations(locale, Lang.DOMAIN, parsedTranslations);
            } catch (e) { }
        });

        this.setLocale(Lang.DEFAULT_LOCALE);
    }

    /**
     * Sets or changes the current locale.
     *
     * @param locale
     */
    setLocale(locale) {
        this.locale = locale;
        this.gt.setLocale(locale);
    }

    /**
     * Binds a special, global "_" shortcut function for convenient gettext API access.
     * The "_" function supports .NET-style string replacements with {0}, {1}, etc markers.
     *
     * @returns function
     */
    bind() {
        global._ = function (input, ...args) {
            if (this.locale !== Lang.DEFAULT_LOCALE) {
                // Only perform gettext() on non-default locales
                // This avoids constant "missing translation" errors during development
                input = this.gt.gettext(input);
            }

            return input.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] !== 'undefined' ? args[number] : match;
            });
        }.bind(this);

        return global._;
    }
}

Lang.DEFAULT_LOCALE = 'en';
Lang.SUPPORTED_LOCALES = ['en', 'user'];
Lang.DOMAIN = 'messages';
Lang.TRANSLATIONS_DIR = global.TIMBOT_ROOT + "/locale";

module.exports = Lang;
