## git 常用操作
* clone
    ```
    git clone ssh://yourname@yourrepopath.git
    ```
* 配置
  ```
  git config --global user.name "yourname"
  git config --global user.email "youremail"
  ```
* 分支操作
  ```
  git checkout -b new-branch 新建分支
  git branch 查看分支
  git branch -a 列出所有分支
  git checkout branchname 切换
  git pull origin branchname --rebase取回远程更新，再合并
  git merge new-branch 合并分支
  git push origin branchname 推送本地更新
  git merge --no-ff 合并时创建一个新的提交对象
  git branch -d branch 删除
  git branch -D 放弃主题分支中的改动

  git commit --amend  合并修改到本地最新提交

  # 跨分支提交
  git cherry-pick <commit id>
  git cherry-pick 76d12 单独检出这条记录修改


  # 回滚至指定版本
  git reset --hard 版本号
  # 通过提交的方式撤销某次提交
  git revert 版本号

  git reflog  显示的是一个 HEAD 发生改变的时间列表
  ```
* 提交描述信息
  feat: 新功能
  fix: 修复问题
  docs: 修改文档
  style: 修改代码格式，不影响代码逻辑
  refactor: 重构代码，理论上不影响现有功能
  perf: 提升性能
  test: 增加修改测试用例
  revert: 回退，建议直接使用Github Desktop回退，而不是使用命令
