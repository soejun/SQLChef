<template>
    <div class="p-4 bg-gray-900 flex flex-col relative">
        <!-- Query textarea -->
        <textarea v-model="localQuery"
            class="w-full h-36 p-2 bg-gray-800 border border-gray-700 rounded-md text-sm font-mono resize-y"
            placeholder="Write your SQL query here..." @keydown.enter.prevent="onKeyDown"></textarea>

        <!-- Buttons -->
        <div class="mt-3 flex items-center space-x-2">
            <button
                class="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors"
                @click="$emit('run-query')" title="Run Query">
                <!-- Play icon -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 3l14 9-14 9V3z" />
                </svg>
                <span>Run</span>
            </button>

            <button
                class="flex items-center space-x-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors"
                @click="$emit('format-query')" title="Format Query">
                <!-- Format icon -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M16 7H8m0 4h8m-8 4h8M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
                </svg>
                <span>Format</span>
            </button>
        </div>

        <!-- Loading indicator with spinner -->
        <div v-if="isLoading" class="mt-4 flex items-center space-x-2">
            <svg class="animate-spin h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span class="text-green-400 font-bold">Running query, please wait...</span>
        </div>

        <!-- Bottom-right: Show query stats if we have them -->
        <div v-if="queryStats"
            class="absolute bottom-4 right-2 text-gray-400 text-xs bg-gray-800 bg-opacity-60 p-2 rounded shadow-md">

            <!-- Single row with file rows, result rows, and time -->
            <div class="flex items-center space-x-3">
                <span>File Rows: {{ fileRowCount || 0 }}</span>
                <span>Results: {{ queryStats.rowsReturned || 0 }}</span>
                <span>Time: {{ (queryStats.durationMs / 1000).toFixed(3) }}s</span>
            </div>

            <!-- Optionally show bytes scanned in a second line -->
            <div v-if="queryStats.bytesScanned" class="mt-1">
                Scanned: {{ formatBytes(queryStats.bytesScanned) }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Query",
    props: {
        query: {
            type: String,
            required: true,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
        queryStats: {
            type: Object,
            default: null,
        },
        // Added: pass in total file row count from Interface
        fileRowCount: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            localQuery: this.query,
        };
    },
    watch: {
        query(newQuery) {
            if (newQuery !== this.localQuery) {
                this.localQuery = newQuery;
            }
        },
        localQuery(newVal) {
            this.$emit("update:query", newVal);
        },
    },
    methods: {
        onKeyDown(event) {
            if (event.shiftKey) {
                // Insert newline
                const ta = event.target;
                const start = ta.selectionStart;
                const end = ta.selectionEnd;
                this.localQuery =
                    this.localQuery.slice(0, start) +
                    "\n" +
                    this.localQuery.slice(end);
                this.$nextTick(() => {
                    ta.selectionStart = ta.selectionEnd = start + 1;
                });
            } else {
                // Run the query on normal Enter
                this.$emit("run-query");
            }
        },
        formatBytes(bytes) {
            if (!bytes || isNaN(bytes)) return "0 B";
            const units = ["B", "KB", "MB", "GB", "TB"];
            let i = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, i)).toFixed(2) + " " + units[i];
        },
    },
};
</script>

<style scoped>
/* Add any styles if needed */
</style>
