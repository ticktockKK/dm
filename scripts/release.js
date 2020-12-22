/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */

const chalk = require('chalk');
const inquirer = require('inquirer');
const cp = require('child_process');
const util = require('util');
const path = require('path');
const exec = util.promisify(cp.exec);

const askCommit = async () => {
  const commit = await inquirer.prompt([{
    type: 'list',
    name: 'result',
    message: '本次发布涉及的所有改动已提交？',
    choices: [
      'yes',
      'no'
    ]
  }]);
  return commit.result;
}

const confirmChangelog = async () => {
  const commit = await inquirer.prompt([{
    type: 'list',
    name: 'result',
    message: '确认changelog',
    choices: [
      'yes'
    ]
  }]);
  return commit.result;
}

const logSuccess = (msg) => {
  console.log(`${chalk.green('✔')} ${msg}`)
}

const run = async () => {
  const cwd = path.resolve(__dirname, '../')
  try {
    // 代码同步
    await exec('git pull', { cwd });
    logSuccess('pull');

    const isCommit = await askCommit();
    if (isCommit === 'no') return;

    // 编译
    await exec(`npm run build`, { cwd });
    logSuccess('编译');


    // 使用lerna发布
    await exec('npm run release:lerna', { cwd });
    logSuccess('发布到npm');

    // // 打tag
    // await exec(`git tag v${version} -am ${version}`, { cwd });
    // logSuccess(`tag：v${version}`);

    // // 以下两步骤可能由于网络问题失败，若出错，手动再执行一次
    // await exec('git push --follow-tags', { cwd }); // 推送commit和tags
    // logSuccess('push');
  } catch (error) {
    console.error(chalk.red(error))
  }
}

run()
