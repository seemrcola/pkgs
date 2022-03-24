import type { IPackageJson } from '@ts-type/package-dts'
export function getPackagesName (packagesJSON: IPackageJson[]): string[] {
  return packagesJSON
    .map(item => item.name)
    .filter(item => item !== undefined) as string []
}
export function createRelyMyMap (packagesName: string[]) {
  const result: Record<string, string[]> = {}
  packagesName.forEach(item => {
    result[item] = []
  })
  return result
}
export function setRelyMyhMap (
  dir: string,
  packageJSON: IPackageJson,
  relyMyMp: Record<string, string[]>,
) {
  const dependencies = getRely(packageJSON)
  if (!Object.keys(dependencies).length) {
    // 没有依赖直接跳过
    return
  }
  Object.keys(relyMyMp)
    .forEach(key => {
      const dependenciesValue = dependencies[key]
      if (dependenciesValue && !dependenciesValue.includes('workspace:*')) {
        relyMyMp[key].push(dir)
      }
    })
}
export function getMyRely (packagesName: string[], packageJSON: IPackageJson) {
  const result: string[] = []
  const dependencies = getRely(packageJSON)
  packagesName.forEach(key => {
    const dependenciesValue = dependencies[key]
    if (dependenciesValue && !dependenciesValue.includes('workspace:*')) {
      result.push(key)
    }
  })
  return result
}
export function getRely (packageJSON: IPackageJson) {
  return {
    ...packageJSON.devDependencies,
    ...packageJSON.dependencies,
  }
}
