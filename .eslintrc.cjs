module.exports = {
    root: true,
    extends: [
        "@kwangure/eslint-config-svelte",
    ],
    globals: {
        chrome: "readonly",
    },
    settings: {
        "import/resolver": {
            alias: {
                map: [
                    ["~@utils", "./src/utils"],
                    ["~@static", "./static"],

                    // escape `$` to work around eslint's Regex matching
                    ["\\$app", "./.patootie/build/_runtime/app"],
                ],
                extensions: [".js", ".svelte", ".json"],
            },
        },
    },
};
