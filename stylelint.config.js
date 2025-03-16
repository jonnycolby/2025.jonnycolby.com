//
//

const make_stylelint_config = () => {
    return {
        extends: [
            "stylelint-config-standard-scss", //
            "stylelint-config-prettier-scss",
        ],
        rules: {
            "selector-class-pattern": null, //
            "no-invalid-double-slash-comments": null,
            "scss/comment-no-empty": null,
            "custom-property-empty-line-before": null,
            "scss/double-slash-comment-empty-line-before": null,
            "declaration-empty-line-before": null,
            "scss/dollar-variable-pattern": null,
            "length-zero-no-unit": null,
            "custom-property-pattern": null,
            "comment-empty-line-before": null,
            "scss/dollar-variable-empty-line-before": null,
            "keyframes-name-pattern": null,
            "rule-empty-line-before": null,
        },
    };
};

//
//
module.exports = make_stylelint_config();
//
//
