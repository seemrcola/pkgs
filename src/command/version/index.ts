import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import { omit } from 'lodash'
import {
  Context,
} from '../../lib/context'
import type { CommandVersionParams, PluginData } from '../type'
import { handleDiffVersion, handleSyncVersion } from './utils'
function main (context: Context, appointVersion?: string) {
  if (context.config.mode === 'diff') {
    return handleDiffVersion(context, appointVersion)
  }
  else {
    return handleSyncVersion(context, appointVersion)
  }
}
export async function commandVersion (
  configParam: CommandVersionParams = {},
  git: SimpleGit = simpleGit(),
  appointVersion?: string,
) {
  const config = await Context.assignConfig({
    mode: configParam.mode,
    version: omit<CommandVersionParams, 'mode'>(configParam, ['mode']),
  })
  const context = await Context.create(
    config,
    git,
  )
  await main(context, appointVersion)
}
export function createVersionPlugin (): PluginData {
  return {
    id: 'version',
    command: 'version',
    description: 'version package',
    option: [
      ['--mode <type>', 'sync | diff'],
      ['-m, --message <message>', 'commit message'],
    ],
    action (context: Context, config: CommandVersionParams = {}) {
      context.assignOptions({
        mode: config.mode,
        version: config,
      })
      main(context)
    },
  }
}
