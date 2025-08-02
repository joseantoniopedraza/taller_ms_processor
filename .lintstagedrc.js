module.exports = {
  '*.ts': [
    'eslint --fix',
    'npm run test -- --findRelatedTests --passWithNoTests'
  ],
}; 