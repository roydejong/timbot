/**
 * Escapes a regex string, escaping any regex reserved characters.
 *
 * @param {string} str
 * @returns {string}
 */
global.escapeRegex = function (str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Performs a "replace all" substring replacement.
 *
 * @param {string} search - Substring to be replaced.
 * @param {string} replacement - String to replace with.
 * @param {boolean} [caseInsensitive] - If true, perform case-insensitive Regex.
 * @returns {string}
 */
String.prototype.replaceAll = function(search, replacement, caseInsensitive) {
    let strTarget = this;
    let regexMode = caseInsensitive ? 'gi' : 'g';

    search = escapeRegex(search);

    return strTarget.replace(new RegExp(search, regexMode), replacement);
};
