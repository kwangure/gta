<script>
    import "@kwangure/strawberry/css/shared.css";
    import { mdiDownload, mdiVolumeHigh } from "@mdi/js";
    import { event_handler } from "~@utils/event.js";
    import Icon from "@kwangure/strawberry/components/Icon";
    import Tooltip from "@kwangure/strawberry/components/Tooltip";

    export let visible;

    const WAITING_FOR_AUDIOPLAY = 0;
    const WAITING_FOR_DOWNLOAD = 1;

    let state = WAITING_FOR_AUDIOPLAY;
    let base64_audio;

    event_handler.on("BATCH_REQUEST", (message) => {
        const { type } = message;
        // The translated text changed, so we wait for user to play audio
        // so that we can grab audio request details for future downloads
        if (type === "translate") {
            state = WAITING_FOR_AUDIOPLAY;
            base64_audio = "";
        } else if (type === "audio") {
            state = WAITING_FOR_DOWNLOAD;
            download(message);
        }
    });

    async function download(request) {
        const { method, request_body, request_headers } = request;
        const headers = {};
        for (const { name, value } of request_headers) {
            headers[name] = value;
        }
        // Combine the pairs into a single string and replace all %-encoded spaces to
        // the '+' character; matches the behavior of browser form submissions.
        const body = Object.entries(request_body.formData)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join("&")
            .replace(/%20/g, "+");

        // Differentiate extension and website requests
        const url = new URL(request.url);
        url.searchParams.set("is_ext", true);
        const response = await fetch(url, { headers, method, body });
        const text = await response.text();

        // Parse out the RPC formatted data
        const [, , , audio_payload] = text.split("\n");
        const [[, , base64_audio_array]] = JSON.parse(audio_payload);
        [base64_audio] = JSON.parse(base64_audio_array);
    }
</script>

<div class="style-wrapper">
    <Tooltip arrow={false}>
        <a
            href={base64_audio ? `data:audio/mp3;base64,${base64_audio}` : ""}
            download
            class="inserted"
            class:visible
            class:disabled={state === WAITING_FOR_AUDIOPLAY}
        >
            <div class="hover-circle">
                <Icon path={mdiDownload} />
            </div>
        </a>
        <svelte:fragment slot="popup">
            {#if state === WAITING_FOR_AUDIOPLAY}
                Touch the <Icon path={mdiVolumeHigh}/> button then download
            {:else if state === WAITING_FOR_DOWNLOAD}
                Download audio
            {/if}
        </svelte:fragment>
    </Tooltip>
</div>

<style>
    .style-wrapper {
        display: contents;
        --br-black-transparent: rgba(60, 64, 67, 0.9);
        --br-item-height: 24px;
        --br-transition-delay: 1s;
    }
    .style-wrapper :global(.berry-tooltip) {
        --berry-icon-size: 15px;
        --br-padding-block: 4px;
        display: flex;
        gap: 2px;
        font-size: 12px;
        font-weight: 500;
        line-height: 16px;
        box-shadow: 0px 2px 2px 0px rgb(0 0 0 / 14%),
            0px 3px 1px -2px rgb(0 0 0 / 12%),
            0px 1px 5px 0px rgb(0 0 0 / 20%);
        transition-delay: 0.25s;
        min-height: 0;
    }
    .style-wrapper :global(.berry-tooltip .berry-icon) {
        --br-icon-size: 15px;
    }
    a {
        display: none;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        color: #5f6368;
        cursor: pointer;
    }
    a.visible {
        display: flex;
    }
    a.disabled {
        color: #b5b6b7;
        cursor: default;
    }
    .hover-circle {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 40px;
        width: 40px;
        border-radius: 50%;
    }
    a:hover .hover-circle {
        background-color: #f5f5f5;
    }
</style>
