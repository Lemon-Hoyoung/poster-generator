
import { ref, watch } from 'vue';
import { useInstructStore } from '@/stores/instruct';
const instructStore = useInstructStore();

export default () => {
  const dataInstructValue = ref('');

  watch(() => dataInstructValue.value, (instruct: string) => {
    instructStore.setInstruct(instruct);
  }, { immediate: true });

  return {
    dataInstructValue,
  };
};