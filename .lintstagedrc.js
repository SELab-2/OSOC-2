const path = require('path')

const buildEslintCommand = (filenames) =>
  `next lint --fix --dir backend frontend`

module.exports = {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand],
}
