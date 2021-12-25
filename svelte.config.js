import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolve(pathname) {
    return path.resolve(__dirname, pathname);
}

export default {
    patootie: {
        manifest: {
            version: 2,
            permissions: [
                "webRequest",
            ],
            host_permissions: [
                "https://translate.google.com/",
            ],
        },
        vite: () => ({
            resolve: {
                alias: {
                    "~@utils": resolve("./src/utils/"),
                },
            },
        }),
    },
};
