<template>
    <div class="flex-1 overflow-auto p-4 relative">
        <div v-if="queryResults.length && !isLoading">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-lg font-semibold text-gray-200">Query Results</h2>
                <button
                    class="text-blue-400 hover:text-blue-400 py-2 px-3 flex items-center justify-center rounded-md transition-colors bg-transparent focus:outline-none"
                    @click="$emit('download-results')" title="Download CSV">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                </button>
            </div>
            <div class="border border-gray-700 rounded-md overflow-auto">
                <table class="w-full border-collapse text-sm">
                    <thead class="bg-gray-800">
                        <tr>
                            <th v-for="(header, idx) in queryResults[0]" :key="idx"
                                class="p-2 border-b border-gray-700 text-left font-semibold text-gray-300">
                                {{ header }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, rowIndex) in queryResults.slice(1)" :key="rowIndex"
                            class="hover:bg-gray-700 transition-colors duration-200">
                            <td v-for="(cell, cellIndex) in row" :key="cellIndex"
                                class="p-2 border-b border-gray-700 text-gray-200">
                                {{ cell }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div v-else-if="!isLoading" class="text-gray-400 italic">
            No query results yet, or table is empty.
        </div>
    </div>
</template>

<script>
export default {
    name: "Results",
    props: {
        queryResults: {
            type: Array,
            required: true,
        },
        isLoading: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<style scoped>
button:hover svg {
    transform: scale(1.1);
    transition: transform 0.2s;
}

button {
    border: none;
    background: transparent;
}

button:focus {
    outline: none;
}

button:focus-visible {
    outline: 2px solid #818cf8;
    outline-offset: 2px;
}
</style>
