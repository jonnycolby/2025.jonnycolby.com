//

const make_prettierrc = (options) => {
    options = options || {};
    return {
        "editor.formatOnSave": true,
        tabWidth: options.indent_spaces || 4,
        useTabs: false,
        printWidth: 240,
        // singleQuote: false, // default
        // arrowParens: "always", // default
        proseWrap: "always",
        semi: true,
        // trailingComma: "all",
        bracketSpacing: true,
        jsxBracketSameLine: false,
    };
};

//
//
module.exports = make_prettierrc({
    indent_spaces: 4,
});
