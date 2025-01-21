<!-- src/components/Uploader.vue -->
<template>
    <div class="flex-1 flex flex-col items-center justify-center p-6">
        <!-- Sample Files Section -->
        <div class="mb-8">
            <h2 class="text-lg font-semibold text-gray-200 mb-2 text-center">Samples</h2>
            <div class="flex space-x-2 justify-center">
                <!-- Button for each sample file -->
                <button v-for="sample in samples" :key="sample.name" @click="loadSample(sample)"
                    class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm">
                    {{ sample.name }}
                </button>
            </div>
        </div>

        <!-- Drag-and-Drop Uploader Box -->
        <div class="w-96 h-64 border-4 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center p-4 bg-gray-800 hover:bg-gray-700 cursor-pointer transition"
            @dragover.prevent="onDragOver" @drop.prevent="onDrop" @click="triggerFileSelect">
            <h2 class="text-xl font-bold mb-2">Drop files here</h2>
            <p class="text-sm text-gray-400 mb-2">or paste URL</p>

            <button
                class="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <span>Upload</span>
            </button>
            <input type="file" ref="fileInput" class="hidden" @change="onFileSelect" />

            <!-- URL input for direct fetch-based loading -->
            <div class="mt-3 w-full flex">
                <input ref="urlInput" type="text"
                    class="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-sm"
                    placeholder="Paste file URL here..." @click.stop @paste.prevent="onPaste" />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Uploader",
    data() {
        return {
            fileUrl: "",
            basePath: import.meta.env.BASE_URL, // Accessing the base path
            samples: [
                {
                    name: "sample.csv",
                    url: `${import.meta.env.BASE_URL}sample.csv`
                },
                {
                    name: "sample.json",
                    url: `${import.meta.env.BASE_URL}sample.json`
                },
                {
                    name: "sample.parquet",
                    url: `${import.meta.env.BASE_URL}sample.parquet`
                }
            ],
        };
    },
    methods: {
        /* DRAG & DROP */
        onDragOver(event) {
            // Let parent know we're dragging
            this.$emit("dragover", event);
        },
        onDrop(event) {
            const files = Array.from(event.dataTransfer.files);
            this.$emit("drop", files);
        },

        /* FILE SELECTION */
        triggerFileSelect() {
            this.$refs.fileInput.click();
        },
        onFileSelect(event) {
            const file = event.target.files[0];
            if (file) {
                this.$emit("file-selected", file);
            }
        },

        /* PASTING A URL */
        async onPaste(e) {
            e.preventDefault();
            const pastedText = e.clipboardData?.getData("text");
            if (!pastedText) return;
            this.fileUrl = pastedText.trim();
            await this.loadRemoteFile(this.fileUrl);
        },

        /* LOAD ONE OF THE SAMPLES */
        async loadSample(sample) {
            // Optionally, set a loading state here
            await this.loadRemoteFile(sample.url);
        },

        /* FETCH A REMOTE FILE & EMIT IT */
        async loadRemoteFile(url) {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(
                        `Could not fetch file:\n ${response.status} ${response.statusText}`
                    );
                }
                const blob = await response.blob();
                // Attempt to derive extension from URL
                let ext = "txt";
                if (url.includes(".")) {
                    ext = url.split(".").pop().split("?")[0] || "txt";
                }
                const filename = `remote_file.${ext}`;
                const file = new File([blob], filename, { type: blob.type });

                // Emit the new file to parent
                this.$emit("file-selected", file);

                // Clear the input fields
                this.fileUrl = "";
                if (this.$refs.urlInput) {
                    this.$refs.urlInput.value = "";
                }
            } catch (error) {
                alert("Error loading file:\n" + error.message);
            }
        },
    },
};
</script>

<style scoped>
/* Adjust any styles or layout if desired. */
</style>
