import { ref } from 'vue'

export function useTextArea() {
  const textValue = ref('hello\ntextarea')

  function handleTextAreaChange(e: Event) {
    textValue.value = (e.target as HTMLTextAreaElement).value
  }

  return { textValue, handleTextAreaChange }
}
