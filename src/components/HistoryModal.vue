<template>
    <!-- Dark overlay -->
    <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <!-- Modal box -->
        <div class="bg-gray-800 p-4 rounded-xl w-96 max-h-[80vh] overflow-auto">
            <!-- Header with Title and Action Buttons -->
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">Query History</h2>
                <div class="flex space-x-2">
                    <!-- Clear History Button with Icon -->
                    <button 
                        @click="$emit('clear-history')" 
                        class="p-1 bg-red-600 hover:bg-red-500 text-white rounded flex items-center justify-center"
                        title="Clear History"
                    >
                        <!-- Clear Icon -->
                        <svg xmlns="http://www.w3.org/2000/svg" 
                             width="24" height="24" 
                             viewBox="0 0 24 24" 
                             fill="none" 
                             stroke="currentColor" 
                             stroke-width="2" 
                             stroke-linecap="round" 
                             stroke-linejoin="round">
                            <path d="M3.49997 12.8995C2.71892 13.6805 2.71892 14.9468 3.49997 15.7279L7.35785 19.5858H4.08576C3.53347 19.5858 3.08576 20.0335 3.08576 20.5858C3.08576 21.1381 3.53347 21.5858 4.08576 21.5858H20.0858C20.638 21.5858 21.0858 21.1381 21.0858 20.5858C21.0858 20.0335 20.638 19.5858 20.0858 19.5858H10.9558L20.4705 10.071C21.2516 9.28999 21.2516 8.02366 20.4705 7.24261L16.2279 2.99997C15.4468 2.21892 14.1805 2.21892 13.3995 2.99997L3.49997 12.8995ZM7.82579 11.4021L4.91418 14.3137L9.15683 18.5563L12.0684 15.6447L7.82579 11.4021ZM9.24 9.98787L13.4826 14.2305L19.0563 8.65683L14.8137 4.41418L9.24 9.98787Z" />
                        </svg>
                    </button>
                    <!-- Close Button -->
                    <button 
                        @click="$emit('close')" 
                        class="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded" 
                        title="Close"
                    >
                        <!-- X / cross icon -->
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- If no history, show a simple message -->
            <div v-if="!history.length" class="text-gray-400 italic text-sm mt-2">
                No queries in history.
            </div>

            <!-- Otherwise list each query -->
            <ul v-else class="space-y-2">
                <li v-for="(item, index) in history" :key="index"
                    class="bg-gray-700 p-2 rounded hover:bg-gray-600 cursor-pointer transition"
                    @click="$emit('restore', item)">
                    <div class="text-sm opacity-70 mb-1">
                        {{ item.timestamp }}
                    </div>
                    <div class="font-mono text-xs text-gray-100">
                        {{ truncate(item.query, 100) }}
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    name: "HistoryModal",
    props: {
        history: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        truncate(str, maxLen) {
            if (!str) return "";
            return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
        },
    }
};
</script>

<style scoped>
button svg {
    width: 20px;
    height: 20px;
}
</style>
