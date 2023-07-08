import { commandVersion } from '../../src/index'
import { getPackages } from '../__fixtures__/commit'
import {
  setUpFilesAdded,
} from '../__fixtures__'
import {
  Interdependence,
  ORIGINAL_CWD,
  addVersion,
  dirInterdependenceArr,
  dirManyArr,
  dirQuarantineArr,
  many,
  newVersion,
  quarantine,
  rootPackageJsonPath,
  single,
} from '../__fixtures__/constant'
import {
  diffTest,
  diffTestPackage,
  diffTestPackageList,
  syncVersionTest,
  tagCommit,
  testPackage,
  testPackages,
  cmd,
  publishPackage,
} from '../__fixtures__/cmd/publish'

afterEach(() => {
  // Many of the tests in this file change the CWD, so change it back after each test
  process.chdir(ORIGINAL_CWD)
})
describe(`${cmd}: ${quarantine}`, () => {
  test.only(`${quarantine}: default(sync)`, async () => {
    const git = await syncVersionTest(quarantine, newVersion)
    await publishPackage(git, dirQuarantineArr, newVersion)
  })
  test(`${quarantine}`, async () => {
    const { git, context } = await diffTest(quarantine, newVersion)
    await diffTestPackageList(dirQuarantineArr, newVersion, git)

    await setUpFilesAdded(context, ['packages/a/test'])
    await commandVersion({
      mode: 'diff',
    }, git, addVersion)
    const [aPackageJson, bPackageJson] = await getPackages(dirQuarantineArr)
    tagCommit(aPackageJson, addVersion, git)
    tagCommit(bPackageJson, newVersion, git)
  })
})
describe(`${cmd}: ${many}`, () => {
  test(`${many}: default(sync)`, async () => {
    await syncVersionTest(many, newVersion)
    await testPackages(dirManyArr, newVersion)
  })
  test(`${many}`, async () => {
    const { git, context } = await diffTest(many, newVersion)
    await diffTestPackageList(dirManyArr, newVersion, git)
    await setUpFilesAdded(context, ['packages/a/test'])
    await commandVersion({
      mode: 'diff',
    }, git, addVersion)
    const packageJsonList = await getPackages(dirManyArr)
    const abPackageJson = packageJsonList.splice(0, 2)
    const abPackageJsonTagList = abPackageJson.map(packageJson => tagCommit(packageJson, addVersion, git))
    const cdePackageJsonTagList = packageJsonList.map(packageJson => tagCommit(packageJson, newVersion, git))
    await abPackageJsonTagList
    await cdePackageJsonTagList
  })
})
describe(`${cmd}: ${Interdependence}`, () => {
  test(`${Interdependence}: default(sync)`, async () => {
    await syncVersionTest(Interdependence, newVersion)
    await testPackages(dirInterdependenceArr, newVersion)
  })
  test(`${Interdependence}`, async () => {
    const { git, context } = await diffTest(Interdependence, newVersion)
    await diffTestPackageList(dirInterdependenceArr, newVersion, git)

    await setUpFilesAdded(context, ['packages/a/test'])
    await commandVersion({
      mode: 'diff',
    }, git, addVersion)
    const [aPackageJson, bPackageJson, cPackageJson] = await getPackages(dirInterdependenceArr)
    await tagCommit(aPackageJson, addVersion, git)
    await tagCommit(bPackageJson, newVersion, git)
    await tagCommit(cPackageJson, addVersion, git)
  })
})

describe(`${cmd}: ${single}`, () => {
  test(`${single}: default(sync)`, async () => {
    await syncVersionTest(single, newVersion)
    await testPackage(rootPackageJsonPath, newVersion)
  })
  test(`${single}`, async () => {
    const { git, context } = await diffTest(single, newVersion)
    await diffTestPackage(rootPackageJsonPath, newVersion, git)
    await setUpFilesAdded(context, ['test'])
    await commandVersion({
      mode: 'diff',
    }, git, addVersion)
    await diffTestPackage(rootPackageJsonPath, addVersion, git)
  })
})
