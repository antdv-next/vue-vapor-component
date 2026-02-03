// @ts-check
import { readFileSync } from 'node:fs'
import path from 'node:path'

const msgPath = path.resolve('.git/COMMIT_EDITMSG')
const msg = readFileSync(msgPath, 'utf-8').trim()

const commitRE =
  /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?: .{1,50}/

if (!commitRE.test(msg)) {
  console.log()
  console.error(
    `  \x1b[47m\x1b[31m ERROR \x1b[0m \x1b[31minvalid commit message format.\x1b[0m\n\n` +
      `\x1b[31m  Proper commit message format is required for automated changelog generation. Examples:\n\n\x1b[0m` +
      `    \x1b[32mfeat(docs): add 'comments' option example for antdv-next\x1b[0m\n` +
      `    \x1b[32mfix(input): correctly handle blur events (close #28)\x1b[0m`
  )
  process.exit(1)
}
