<template>
    <aside class="hidden md:flex md:flex-col border-r border-gray-700 bg-gray-800 p-4 h-full"
        style="overflow: auto; min-width: 250px; max-width: 320px">
        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto space-y-6">
            <!-- Columns Section -->
            <div>
                <h2 class="text-lg font-semibold mb-3">Columns</h2>

                <!-- Spinner if file is currently loading -->
                <div v-if="isLoadingFile" class="mb-4 flex items-center space-x-2">
                    <svg class="animate-spin h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span class="text-green-400 font-bold">
                        Loading columns...
                    </span>
                </div>

                <!-- Table of columns if not loading -->
                <div v-else class="overflow-y-auto max-h-128">
                    <table class="w-full text-sm rounded-md shadow-inner table-fixed">
                        <tbody>
                            <tr v-for="(col, index) in localColumns" :key="index"
                                class="hover:bg-gray-800 transition-colors duration-200">
                                <td
                                    class="p-2 border-b border-gray-600 flex items-center justify-between text-gray-200">
                                    <!-- If editing? Show input. Otherwise show text -->
                                    <div v-if="col.isEditing" class="flex-1">
                                        <input v-model="col.editValue" type="text"
                                            class="bg-gray-900 border border-gray-700 rounded p-1 w-full"
                                            @keyup.enter="finishEdit(index)" @blur="finishEdit(index)" />
                                    </div>
                                    <div v-else class="flex-1 truncate">
                                        {{ col.column_name }}
                                    </div>

                                    <!-- Pencil icon if not editing, else no icon -->
                                    <span v-if="!col.isEditing"
                                        class="text-gray-400 hover:text-gray-200 p-1 ml-1 transition"
                                        @click="startEdit(index)" title="Rename Column">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="1.5" stroke="currentColor" class="size-4">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                        </svg>
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- File Details Section (optional, commented out) -->
            <!--
            <div>
                <h2 class="text-lg font-semibold mb-3">File Details</h2>
                <ul class="space-y-1 text-sm text-gray-200">
                    <li>
                        <span class="font-semibold text-gray-300">Name:</span>
                        {{ currentFile.name }}
                    </li>
                    <li>
                        <span class="font-semibold text-gray-300">Size:</span>
                        {{ formatFileSize(currentFile.size) }}
                    </li>
                    <li>
                        <span class="font-semibold text-gray-300">Rows:</span>
                        {{ fileRowCount }}
                    </li>
                    <li>
                        <span class="font-semibold text-gray-300">Extension:</span>
                        {{ fileExtension }}
                    </li>
                </ul>
            </div>
            -->
        </div>

        <!-- Footer: parse/re-upload section -->
        <div class="mt-6">
            <!-- Parse Options Section -->
            <div>
                <div v-if="importError" class="mb-4 p-2 bg-red-800 text-red-100 rounded-md">
                    <strong>Import Error:</strong> {{ importError }}
                    <p class="text-sm mt-1">
                        Please adjust parse options below and click "Re-Parse".
                    </p>
                </div>

                <!-- CSV Options -->
                <div v-if="['csv', 'txt', 'tsv'].includes(fileExtension)" class="mb-4">
                    <h2 class="text-lg font-semibold">CSV Options</h2>

                    <!-- Basic Options -->
                    <label class="block mb-1 text-sm mt-2">
                        Delimiter:
                        <input type="text" v-model="csvOptions.delimiter"
                            class="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md"
                            placeholder="e.g. , or \t" />
                    </label>

                    <label class="flex items-center mt-2 text-sm">
                        <input type="checkbox" v-model="csvOptions.header" class="mr-2" />
                        Has Header
                    </label>

                    <!-- Toggle for advanced -->
                    <span
                        class="mt-3 text-gray-200 text-sm flex items-center cursor-pointer hover:text-gray-400 transition-colors"
                        @click="showAdvancedCsv = !showAdvancedCsv" role="button" tabindex="0"
                        @keydown.enter="showAdvancedCsv = !showAdvancedCsv">
                        <!-- Arrow Icon -->
                        <span class="inline-block transform transition-transform duration-200"
                            :class="showAdvancedCsv ? 'rotate-90' : 'rotate-0'">
                            &#9654; <!-- ▶ -->
                        </span>
                        <span class="ml-2">Advanced</span>
                    </span>

                    <!-- Advanced Options (hidden by default) -->
                    <transition name="fade">
                        <div v-if="showAdvancedCsv" class="mt-3 space-y-3 text-sm">
                            <!-- onError -->
                            <label class="block">
                                On Parse Error:
                                <select v-model="csvOptions.onError"
                                    class="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md">
                                    <option value="fail">Fail</option>
                                    <option value="ignore">Ignore</option>
                                    <option value="replace">Replace</option>
                                </select>
                                <p class="text-xs text-gray-400 mt-1">
                                    "Ignore" or "Replace" will skip invalid
                                    rows (
                                    <code>ignore_errors=TRUE</code>)
                                </p>
                            </label>

                            <!-- quote -->
                            <label class="block">
                                Quote Character:
                                <input type="text" v-model="csvOptions.quote"
                                    class="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md"
                                    placeholder='e.g. " or ' />
                            </label>

                            <!-- escape -->
                            <label class="block">
                                Escape Character:
                                <input type="text" v-model="csvOptions.escape"
                                    class="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md"
                                    placeholder='e.g. " or \' />
                            </label>

                            <!-- skip -->
                            <label class="block">
                                Skip Lines:
                                <input type="number" v-model.number="csvOptions.skip"
                                    class="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md" min="0" />
                            </label>

                            <!-- comment -->
                            <label class="block">
                                Comment Char:
                                <input type="text" v-model="csvOptions.comment"
                                    class="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md"
                                    placeholder="#" />
                            </label>
                        </div>
                    </transition>

                    <!-- Re-Parse Button -->
                    <button class="mt-3 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md w-full"
                        @click="$emit(' recreate-table')">
                        Re-Parse
                    </button>
                </div>

                <!-- JSON / NDJSON Options -->
                <div v-else-if="fileExtension === 'json' || fileExtension === 'ndjson'" class="mb-4">
                    <h4 class="font-semibold mb-2">JSON / NDJSON</h4>
                    <label class="block mb-1 text-sm">
                        Format:
                        <select v-model="jsonOptions.format"
                            class="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md">
                            <option value="auto">Auto (read_json_auto)</option>
                            <option value="ndjson">
                                NDJSON (read_ndjson)
                            </option>
                        </select>
                    </label>
                    <button class="mt-3 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md w-full"
                        @click="$emit('recreate-table')">
                        Re-Parse
                    </button>
                </div>
            </div>

            <!-- Re-upload File Section -->
            <div class="mt-4">
                <div class="w-full h-40 border-2 border-dashed border-gray-500 rounded-md flex items-center justify-center bg-gray-700 hover:bg-gray-600 cursor-pointer transition"
                    @dragover.prevent="onDragOver" @drop.prevent="onDrop" @click="triggerFileSelect">
                    <div class="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto text-gray-300" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12v6m0 0l-3-3m3 3l3-3" />
                        </svg>
                        <p class="text-gray-300 mt-2 font-semibold">
                            Drag & Drop to Re-upload
                        </p>
                        <p class="text-gray-400 text-sm">or paste url</p>

                        <div class="mt-2 flex">
                            <input ref="urlInput" type="text"
                                class="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-sm"
                                placeholder="https://example.com/data.csv" @click.stop @paste.prevent="onPaste" />
                        </div>
                    </div>
                    <input type="file" ref="fileInputReplace" class="hidden" @change="handleFileReplace" />
                </div>
            </div>
        </div>
    </aside>
</template>

<script>
export default {
    name: "Sidebar",
    props: {
        currentFile: { type: Object, required: true },
        fileExtension: { type: String, required: true },
        uploadDate: { type: String, required: true },
        fileRowCount: { type: [Number, String], required: true },
        fileColumns: { type: Array, required: true },
        csvOptions: { type: Object, required: true },
        jsonOptions: { type: Object, required: true },
        importError: { type: String, default: null },
        isLoadingFile: { type: Boolean, default: false }, // Show/hide the "Loading columns..." spinner
    },
    data() {
        return {
            fileUrl: "",
            showAdvancedCsv: false, // Toggle advanced CSV options

            // We'll copy the parent's fileColumns into a local array
            // so we can store "isEditing" + "editValue" per column
            localColumns: [],
        };
    },
    watch: {
        // When fileColumns change, rebuild localColumns
        fileColumns: {
            immediate: true,
            handler(newCols) {
                this.localColumns = newCols.map((c) => ({
                    ...c,
                    isEditing: false,
                    editValue: c.column_name,
                }));
            },
        },
    },
    methods: {
        formatFileSize(bytes) {
            if (bytes === 0) return "0 Bytes";
            const k = 1024;
            const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
        },
        onDragOver(event) {
            event.preventDefault();
            event.stopPropagation();
        },
        onDrop(event) {
            const files = Array.from(event.dataTransfer.files);
            const newFile = files.find((f) => this.isStructuredFile(f));
            if (!newFile) {
                alert(
                    "Please drop a valid structured file (CSV, TSV, TXT, JSON, NDJSON, or Parquet)."
                );
                return;
            }
            this.$emit("file-selected", newFile);
        },
        triggerFileSelect() {
            this.$refs.fileInputReplace.click();
        },
        handleFileReplace(event) {
            const file = event.target.files[0];
            if (file && this.isStructuredFile(file)) {
                this.$emit("file-selected", file);
            } else {
                alert(
                    "Invalid file type. Must be CSV, TSV, TXT, JSON, NDJSON, or Parquet."
                );
            }
        },
        isStructuredFile(file) {
            const ext = file.name.split(".").pop().toLowerCase();
            return ["csv", "tsv", "txt", "json", "ndjson", "parquet"].includes(ext);
        },
        async onPaste(e) {
            e.preventDefault();
            const pastedText = e.clipboardData?.getData("text");
            if (!pastedText) return;
            this.fileUrl = pastedText.trim();

            try {
                const response = await fetch(this.fileUrl);
                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch: ${response.status} ${response.statusText}`
                    );
                }
                const blob = await response.blob();

                // Derive extension from the URL, fallback to .txt
                let ext = "txt";
                if (this.fileUrl.includes(".")) {
                    ext = this.fileUrl.split(".").pop().split("?")[0] || "txt";
                }
                const fileName = `remote_file.${ext}`;

                // Create a File object
                const file = new File([blob], fileName, { type: blob.type });
                this.$emit("file-selected", file);

                // Clear the URL input
                this.fileUrl = "";
                if (this.$refs.urlInput) {
                    this.$refs.urlInput.value = "";
                }
            } catch (error) {
                alert("Error loading file from URL:\n" + error.message);
            }
        },

        // Start editing a column
        startEdit(index) {
            this.localColumns.forEach((c) => (c.isEditing = false));
            this.localColumns[index].isEditing = true;
        },

        // Called when user presses Enter or leaves the field
        finishEdit(index) {
            const col = this.localColumns[index];
            if (!col.isEditing) return;

            col.isEditing = false;
            const oldName = col.column_name;
            const newName = col.editValue.trim();
            if (!newName || newName === oldName) {
                col.editValue = oldName;
                return;
            }
            this.$emit("rename-column", { oldName, newName });
        },
    },
};
</script>

<style scoped>
.table-fixed {
    table-layout: fixed;
}

td,
th {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

input {
    outline: none;
}
</style>
