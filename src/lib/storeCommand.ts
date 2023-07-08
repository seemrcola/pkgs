import type { SimpleGit } from 'simple-git'
import simpleGit from 'simple-git'
import type IPackageJson from '@ts-type/package-dts'
import { gt } from 'lodash'
import type { DiffFile } from '../utils/git'
import { getStageInfo, getWorkInfo, getVersionDiffFile } from '../utils/git'
import { createCommand, runCmdList, warn } from '../utils'
import { WARN_NOW_RUN } from '../constant'
import { getPackageNameVersion } from '../utils/packageJson'
import type { AnalysisBlockItem, ContextAnalysisDiagram } from './analysisDiagram'
export {
  StoreCommand,
  ForPackCallback,
}

class StoreCommand {
  contextAnalysisDiagram: ContextAnalysisDiagram
  git: SimpleGit
  constructor (
    contextAnalysisDiagram: ContextAnalysisDiagram,
    git: SimpleGit = simpleGit(),
  ) {
    this.contextAnalysisDiagram = contextAnalysisDiagram
    this.git = git
  }

  async forRepositorySyncPack (callback: ForPackCallback, separator = 'v') {
    const file = await this.getFileSyncList(separator)
    if (file) {
      const relatedPackagesDir = await this.getRepositoryInfo([file])
      await this.forPack(relatedPackagesDir, callback)
    }
  }

  async forRepositoryDiffPack (callback: ForPackCallback, separator = 'v') {
    const files = await this.getFileList(packageJson => getPackageNameVersion(
      packageJson, separator,
    ))
    const relatedPackagesDir = await this.getRepositoryInfo(files)
    await this.forPack(relatedPackagesDir, callback)
  }

  async workDiffFile () {
    const files = await getWorkInfo(this.git)
    const relatedPackagesDir = this.contextAnalysisDiagram.getRelatedPackagesDir(files)
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.forPack(relatedPackagesDir, source => {
        cd(source)
      }),
    )
  }

  async stageDiffFile () {
    const files = await getStageInfo(this.git)
    const relatedPackagesDir = this.contextAnalysisDiagram.getRelatedPackagesDir(files)
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.forPack(relatedPackagesDir, source => {
        cd(source)
      }),
    )
  }

  async repositoryDiffFile (separator?: string) {
    return this.contextAnalysisDiagram.getRelatedDir(cd =>
      this.forRepositoryDiffPack(source => {
        cd(source)
      }, separator),
    )
  }

  async commandBatchRun (diffDirs: string[], cmdStr: string) {
    const orderDirs = this.contextAnalysisDiagram.getDirTopologicalSorting(diffDirs)
    const cmd = createCommand(cmdStr, orderDirs)

    if (cmd.length) {
      const cmdStrList = await runCmdList(cmd)
      return cmdStrList
    }
    else {
      warn(WARN_NOW_RUN)
    }
  }

  async getFileSyncList (separator?: string) {
    const packageJson = this.contextAnalysisDiagram.allPackagesJSON
      .reduce(
        (aPackageJson, bPackageJson) => gt(bPackageJson.version as string, aPackageJson.version as string)
          ? bPackageJson
          : aPackageJson,
      )
    let result: DiffFile
    if (packageJson && packageJson.version) {
      result = await getVersionDiffFile(separator + packageJson.version)
    }
    return result
  }

  // 拿到相关包的文件修改范围
  async getFileList (createVersion: (packageJson: IPackageJson) => string) {
    const fileList = this.contextAnalysisDiagram.allPackagesJSON
      .map(packageJson => getVersionDiffFile(
        createVersion(packageJson),
        this.git))
    const result = await Promise.all(fileList)
    return result
  }

  async getRepositoryInfo (fileList: DiffFile[]) {
    const relatedPackagesDir: Set<string> = new Set()
    const dirs = this.contextAnalysisDiagram.allDirs

    // 收集包对应的dir
    fileList.forEach((file, index) => {
      if (file === true) {
        relatedPackagesDir.add(dirs[index])
      }
      else {
        const dirList = this.contextAnalysisDiagram.getRelatedPackagesDir(file)
        dirList.forEach(dir => relatedPackagesDir.add(dir))
      }
    })
    return [...relatedPackagesDir]
  }

  private async forPack (relatedPackagesDir: string[], callback: ForPackCallback) {
    for (let index = 0; index < relatedPackagesDir.length; index++) {
      const dir = relatedPackagesDir[index]
      await callback(this.contextAnalysisDiagram.analysisDiagram[dir], index)
    }
  }
}
type ForPackCallback = (
  analysisBlock: AnalysisBlockItem,
  index: number,
) => Promise<any> | void
