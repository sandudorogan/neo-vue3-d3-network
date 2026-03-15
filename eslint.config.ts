import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  markdown: false,
  stylistic: {
    quotes: 'single',
    semi: false,
  },
  ignores: ['docs/**', 'dist/**', 'dist-showcase/**'],
  rules: {
    'no-console': 'warn',
    'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
    'vue/define-macros-order': ['error', { order: ['defineProps', 'defineEmits'] }],
    'vue/custom-event-name-casing': ['error', 'kebab-case'],
  },
})
