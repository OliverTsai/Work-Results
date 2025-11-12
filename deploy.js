const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 設置工作目錄
const projectRoot = process.cwd();
const distPath = path.join(projectRoot, 'dist');
const tempPath = path.join(projectRoot, 'temp_deploy');

try {
  // 構建
  console.log('開始構建專案...');
  execSync('npm run build', { stdio: 'inherit' });

  // 確保 dist 目錄存在
  if (!fs.existsSync(distPath)) {
    throw new Error('dist 目錄不存在，構建可能失敗');
  }

  // 創建一個臨時目錄（如果已存在，先刪除）
  console.log('創建一個臨時目錄...');
  if (fs.existsSync(tempPath)) {
    execSync('rmdir /s /q temp_deploy', { stdio: 'inherit' });
  }
  fs.mkdirSync(tempPath);

  // 複製構建文件到臨時目錄
  console.log('複製構建文件到臨時目錄...');
  execSync('xcopy dist\\* temp_deploy\\ /E /I /H /Y', { stdio: 'inherit' });

  // 進入臨時目錄
  console.log('進入臨時目錄...');
  process.chdir(tempPath);

  // 初始化全新的 git 倉庫
  console.log('初始化全新的 Git 倉庫...');
  // 刪除可能存在的 .git 目錄
  if (fs.existsSync(path.join(tempPath, '.git'))) {
    execSync('rmdir /s /q .git', { stdio: 'inherit' });
  }
  
  // 初始化新的 git 倉庫
  execSync('git init', { stdio: 'inherit' });
  
  // 設置 git 用戶信息（如果需要）
  try {
    execSync('git config user.name "GitHub Actions"', { stdio: 'inherit' });
    execSync('git config user.email "actions@github.com"', { stdio: 'inherit' });
  } catch (e) {
    console.log('設置 git 用戶信息失敗，但繼續執行...');
  }
  
  // 添加所有文件
  execSync('git add -A', { stdio: 'inherit' });
  
  // 嘗試提交，如果沒有更改則創建空提交
  try {
    execSync('git commit -m "Manual deploy to GitHub Pages"', { stdio: 'inherit' });
  } catch (e) {
    console.log('沒有更改需要提交，創建空提交...');
    execSync('git commit --allow-empty -m "Manual deploy to GitHub Pages (empty commit)"', { stdio: 'inherit' });
  }
  
  // 添加遠程倉庫
  try {
    execSync('git remote add origin "https://github.com/OliverTsai/Work-Results.git"', { stdio: 'inherit' });
  } catch (e) {
    console.log('遠程倉庫可能已存在，嘗試更新...');
    execSync('git remote set-url origin "https://github.com/OliverTsai/Work-Results.git"', { stdio: 'inherit' });
  }

  // 推送到 GitHub Pages
  console.log('推送到 GitHub Pages...');
  execSync('git push -f origin master:gh-pages', { stdio: 'inherit' });

  // 返回專案根目錄
  console.log('返回專案根目錄...');
  process.chdir(projectRoot);

  // 清理臨時目錄
  console.log('清理臨時目錄...');
  execSync('rmdir /s /q temp_deploy', { stdio: 'inherit' });
  
  console.log('部署成功!');
} catch (error) {
  console.error(`部署失敗: ${error.message}`);
  process.exit(1);
}