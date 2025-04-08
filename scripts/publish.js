const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 解析命令行参数
const args = process.argv.slice(2);
const isLocalInstall = args.includes('--local');
const TRAE_BIN_PATH = 'D:\\Programs\\Trae\\bin';

// 读取 package.json
let packageJson;
try {
    packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
} catch (error) {
    console.error('读取 package.json 失败:', error.message);
    process.exit(1);
}

// 获取访问令牌
let ovsxPat;
try {
    // 尝试从配置文件读取令牌
    const tokensPath = path.join(__dirname, '..', '.tokens.json');
    if (fs.existsSync(tokensPath)) {
        const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
        const packageName = packageJson.name;
        ovsxPat = tokens.tokens?.[packageName]?.ovsx_pat;
    }
} catch (error) {
    console.warn('读取配置文件失败:', error.message);
}

// 如果配置文件中没有找到令牌，尝试从环境变量读取
if (!ovsxPat) {
    ovsxPat = process.env.OVSX_PAT;
    if (!ovsxPat) {
        console.error('错误: 未在.tokens.json或环境变量中找到OVSX_PAT');
        process.exit(1);
    }
}

try {
    // 获取插件包名
    const vsixFileName = `${packageJson.name}-${packageJson.version}.vsix`;
    
    // 验证必要的字段
    const requiredFields = ['name', 'version', 'publisher', 'engines.vscode'];
    for (const field of requiredFields) {
        const value = field.split('.').reduce((obj, key) => obj && obj[key], packageJson);
        if (!value) {
            console.error(`错误: package.json 中缺少必要字段: ${field}`);
            process.exit(1);
        }
    }

    // 运行构建
    console.log('正在构建插件...');
    execSync('npm run build', { stdio: 'inherit' });

    // 打包插件
    console.log('正在打包插件...');
    execSync('vsce package', { stdio: 'inherit' });

    if (isLocalInstall) {
        // 本地安装
        console.log('正在安装插件到本地...');
        execSync(`"${path.join(TRAE_BIN_PATH, 'trae')}" --install-extension ${vsixFileName}`, { stdio: 'inherit' });
        console.log('本地安装成功！');
    } else {
        // 发布到 Open VSX Registry
        console.log('正在发布到 Open VSX Registry...');
        execSync(`ovsx publish --pat ${ovsxPat}`, { stdio: 'inherit' });
        console.log('发布成功！');
    }
} catch (error) {
    console.error('发布过程中出现错误:', error);
    process.exit(1);
}