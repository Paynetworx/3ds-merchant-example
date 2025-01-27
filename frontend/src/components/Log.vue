<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

interface LogEntry {
  timestamp: string;
  message: string;
}

const props = withDefaults(defineProps<{
  maxHeight?: string;
}>(), {
  maxHeight: '300px'
});

const logs = ref<LogEntry[]>([]);
const terminalRef = ref<HTMLDivElement | null>(null);

const scrollToBottom = () => {
  if (terminalRef.value) {
    terminalRef.value.scrollTop = terminalRef.value.scrollHeight;
  }
};

const appendLog = (message: string) => {
  const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);
  logs.value.push({ timestamp, message });
};

onMounted(() => {
  scrollToBottom();
});

watch(logs, () => {
  scrollToBottom();
}, { deep: true });

defineExpose({ appendLog });
</script>

<template>
  <h3>Logs</h3>
  <div class="terminal" ref="terminalRef" :style="{ maxHeight: maxHeight }">
    <div v-for="(log, index) in logs" :key="index" class="log-entry">
      <span class="timestamp">{{ log.timestamp }}</span>
      <span class="message">{{ log.message }}</span>
    </div>
  </div>
</template>

<style scoped>
.terminal {
  font-family: monospace;
  background-color: #1e1e1e;
  color: #ffffff;
  padding: 10px;
  overflow-y: auto;
  border-radius: 5px;
}

.log-entry {
  margin-bottom: 5px;
}

.timestamp {
  color: #888888;
  margin-right: 10px;
}

.message {
  white-space: pre-wrap;
}
</style>
