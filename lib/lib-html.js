/**
 * A class that provides a small amount of XSS protection. It does
 * so by ensuring that provided content is not rendered as HTML unless
 * it is wrapped in a TemplateResult. This means all variables in the
 * template string have the "<" and ">" characters turned into "&lt;"
 * and "&gt;" respectively. While this isn't comprehensive protect, it's
 * enough for most situations.
 * 
 * For more complex situations see `unsafe` function exported from this
 * file. It details a way to bypass this protection.
 * 
 * For more robust protections, you can write your own sanitizer using
 * any number of quality libaries. Below is a psudeo code example of how
 * to write a re-usable function to do that.
 * 
 * ```javascript
 * function mySanitizationFunction(unsafe_user_created_content) {
 *   const safe_string = someSantizingFunction(unsafe_user_created_content);
 *   return new TemplateResult([safe_string], []);
 * }
 * ```
 * 
 * Then use that function as so:
 * 
 * ```html
 * const myTemplate = (data) => html`
 *   <div>
 *     ${mySanitizationFunction(data.really_unsafe_user_content)}
 *   </div>
 * `;
 * ```
 */
 class TemplateResult {
    constructor(strings, args, options) {
        this.strings = strings;
        this.args = args;
        this.options = options;
    }

    async render() {
        let str = "";
        const { strings, args, options } = this;
        for (let index = 0; index < strings.length; index++) {
            str += strings[index];
            if (args[index]) {
                let res = await args[index];
                str += await this.parseTemplate(res);
            }
        }
        
        return str;
    }

    async parseTemplate(template) {
        let str = "";
        if (Array.isArray(template)) {
            for (const t of template) {
                str += await this.parseTemplate(await t);
            }
            return str;
        }

        if (template instanceof TemplateResult) {
            str += await template.render();
        } else if (typeof template === "string") {
            template = template.replace(/</g, "&lt;");
            template = template.replace(/>/g, "&gt;");
            str += template;
        }

        return str;
    }
}
exports.TemplateResult = TemplateResult;

/**
 * A JavaScript template string tag that returns a TemplateResult for later
 * rendering by the express engine.
 * 
 * Usage:
 * ```javascript
 * const myTemplate = (data) => html`<div>${data.some_stuff}</div>`;
 * ```
 * @param {string[]} strings static strings from the JavaScript template string
 * @param  {...any} args values to inject between the above static strings
 * @returns {TemplateResult}
 */
exports.html = async function html(strings, ...args) {
    return new TemplateResult(strings, args);
}

/**
 * Create a template result that bypasses normal XSS protections. That is useful
 * within other html template strings.
 * 
 * Usage:
 * ```javascript
 * const template = () => html`
 *   <div>
 *     ${"<div>This will be escaped.</div>"}
 *     ${unsafe("<div>this will be rendered with tags intact.</div>")}
 *   </div>
 * `;
 * ```
 * @param {string} str a string characters you wish to render
 * @returns {TemplateResult}
 */
exports.unsafe = (str) => {
    return new TemplateResult([str], []);
}
