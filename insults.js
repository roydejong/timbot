const insults = require('./insults.json').insults;

let insultTexts = [];

for (let workKey in insults) {
    let work = insults[workKey];

    for (let quoteKey in work.quotes) {
        let quote = work.quotes[quoteKey];
        insultTexts.push(quote.quote);
    }
}

module.exports = class Insults {
    static getInsult() {
        if (insultTexts.length > 0) {
            let insultTextRaw = insultTexts[Math.floor(Math.random() * insultTexts.length)] || "You suck.";

            insultTextRaw = insultTextRaw.toString();
            insultTextRaw = insultTextRaw.lowercaseFirstChar();

            if (!insultTextRaw.endsWith(".")) {
                insultTextRaw += ".";
            }

            return insultTextRaw;
        }

        return "You suck.";
    }
};