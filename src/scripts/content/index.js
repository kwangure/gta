import Download from "./lib/components/download.svelte";

const controls = document.querySelector("#yDmH0d > c-wiz > div > div.WFnNle > c-wiz > div.OlSOob > c-wiz > div.ccvoYb > div.AxqVh > div.OPPzxe > c-wiz.rm1UF.UnxENd > div.FFpbKc");

function mount() {
    const word_count = controls.querySelector(":scope > span");

    // Wait for anchor so that we insert our button in the right place
    if (!word_count) return;

    const download_component = new Download({
        target: controls,
        anchor: word_count,
    });
    const listen_btn = controls.querySelector(":scope > .r375lc");

    new ResizeObserver(([listen_btn_entry]) => {
        // `listen_btn` is hidden when there's no text to translate
        // Hide download button when `listen_btn` is hidden
        download_component.$set({
            // `display: none;` elements have zero width
            visible: Boolean(listen_btn_entry.contentRect.width),
        });
    }).observe(listen_btn);
}

// Create an observer instance linked to the callback function
const observer = new MutationObserver(function remount_btn(mutationsList) {
    for (const mutation of mutationsList) {
        const { removedNodes } = mutation;
        if (removedNodes.length) {
            for (const element of removedNodes) {
                if (element.matches?.(".style-wrapper")) {
                    mount();
                    break;
                }
            }
        }
    }
});

mount();

// Observing controls for addition and removal of immediate children
observer.observe(controls, { childList: true });

window.onbeforeunload = observer.disconnect;
