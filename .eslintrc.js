//
// REFERENCE: https://www.freecodecamp.org/news/how-to-set-up-eslint-prettier-stylelint-and-lint-staged-in-nextjs
//

const make_eslintrc = () => {
    return {
        // QUESTION: do we only use EITHER "plugins" or "extends"?
        // "plugins": ["next"], // "eslint-plugin-" prefix is omitted // "eslint-plugin-next" includes "core-web-vitals", "@next/next", "plugin:@next/next/recommended", etc (?)
        extends: ["next/core-web-vitals", "prettier"], // "eslint-config-" prefix is omitted -> "eslint-config-next/..." and "eslint-config-prettier"
        rules: {
            // ...
        },
    };
};

//
//
module.exports = make_eslintrc();
//
//
