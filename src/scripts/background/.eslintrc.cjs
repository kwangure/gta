const shared_aliases = require("../../../.eslintrc.cjs").settings["import/resolver"].alias.map;

module.exports = {
    settings: {
        "import/resolver": {
            alias: {
                map: [
                    ...shared_aliases,
                    // escape `$` to work around eslint's Regex matching
                    ["\\$lib", "./src/scripts/background/lib"],
                ],
                extensions: [".js", ".svelte", ".json"],
            },
        },
    },
};
