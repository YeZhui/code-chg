const { execSync } = require('child_process');

try {
    // 安装依赖
    console.log('正在安装依赖...');
    execSync('npm install', { stdio: 'inherit' });

    // 安装 ovsx 和 vsce 工具
    console.log('正在安装打包和发布工具...');
    execSync('npm install -g ovsx vsce', { stdio: 'inherit' });

    console.log('安装完成！');
} catch (error) {
    console.error('安装过程中出现错误:', error);
    process.exit(1);
}