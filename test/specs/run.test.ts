
import { Mode } from '../../src/constant'
import { cmd, createRun, testMain } from '../__fixtures__/cmd/run'
import {
  Interdependence,
  dirInterdependenceRun,
  dirManyCommandOrder,
  dirManyCommandOrderChange1,
  dirQuarantineCommandOrder,
  dirQuarantineCommandOrderChange1,
  dirQuarantineNotTestCommandOrder,
  dirQuarantineNotTestCommandOrderChange1,
  many,
  quarantine,
  quarantineNotTest,
  rootPackageJsonCommandOrder,
  rootPackageJsonCommandOrderChange1,
  single,
} from '../__fixtures__/constant'
const ORIGINAL_CWD = process.cwd()

describe(cmd, () => {
  afterEach(() => {
    // Many of the tests in this file change the CWD, so change it back after each test
    process.chdir(ORIGINAL_CWD)
  })
  // 没有该命令的包不运行
  test(quarantineNotTest, async () => {
    const arr = createRun(dirQuarantineNotTestCommandOrder)
    const arr2 = createRun(dirQuarantineNotTestCommandOrderChange1)
    await testMain(quarantineNotTest, arr, arr2, Mode.SYNC)
    await testMain(quarantineNotTest, arr, arr2, Mode.DIFF)
  })
  // 无依赖+rootPackage: false
  test(quarantine, async () => {
    const arr = createRun(dirQuarantineCommandOrder)
    const arr2 = createRun(dirQuarantineCommandOrderChange1)
    await testMain(quarantine, arr, arr2, Mode.SYNC)
    await testMain(quarantine, arr, arr2, Mode.DIFF)
  })
  // 复杂依赖
  test(many, async () => {
    const arr = createRun(dirManyCommandOrder)
    const arr2 = createRun(dirManyCommandOrderChange1)
    await testMain(many, arr, arr2, Mode.SYNC)
    await testMain(many, arr, arr2, Mode.DIFF)
  })
  // 依赖循环
  test(Interdependence, async () => {
    const arr = createRun(dirInterdependenceRun)
    const arr2 = createRun(dirInterdependenceRun)
    await testMain(Interdependence, arr, arr2, Mode.SYNC)
    await testMain(Interdependence, arr, arr2, Mode.DIFF)
  })
  // 单项目
  test(single, async () => {
    const arr = createRun(rootPackageJsonCommandOrder)
    const arr2 = createRun(rootPackageJsonCommandOrderChange1)
    await testMain(single, arr, arr2, Mode.SYNC)
    await testMain(single, arr, arr2, Mode.DIFF)
  })
})
