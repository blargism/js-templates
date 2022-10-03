const { html, unsafe, TemplateResult } = require("./lib/lib-html");

/**
 * A blazing fast and pasionately unopinionated JS template based template engine.
 * @param app The Express application object.
 */
function engine(app) {
    // Register the engine to look for .js files
    app.engine('js', async (path, options, cb) => {
        try {
            // find the requested template
            let rendered = require(path);

            // check the type of the returned template, it can be a string or a function.
            switch(typeof rendered) {
                case "string":
                    return cb(null, rendered);
                case "function":
                    let res;
                    // Get the result of the function, either async or no.
                    if (rendered.constructor.name === "AsyncFunction") {
                        res = await rendered(options);
                    } else {
                        res = rendered(options);
                    }

                    if (res?.constructor?.name === "TemplateResult") {
                        return cb(null, await res.render());
                    } else if (typeof res === "string") {
                        return cb(null, res);
                    } else {
                        return cb(new Error(`Template was of type ${typeof rendered}, must be a string, promise, or function.`));
                    }
                default:
                    return cb(new Error(`Template was of type ${typeof rendered}, must be a string, promise, or function.`));
            }
        } catch(err) {
            console.error(err);
            cb(err);
        }
    });
}

module.exports = {
    engine,
    html,
    TemplateResult,
    unsafe,
}