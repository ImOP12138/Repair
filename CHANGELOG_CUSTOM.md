# 南外家电维修 - 项目改动记录

## 改动概述

本文档记录了将原"校园报修小程序"改造为"南外家电维修"的所有改动内容。

---

## 已完成的改动

### 1. 管理员密码修改
**文件**: `cloudfunctions/mcloud/project/repair/service/base_project_service.js`

| 项目 | 原值 | 新值 |
|------|------|------|
| 管理员账号 | admin | admin (不变) |
| 管理员密码 | 123456 | 518518 |
| MD5值 | e10adc3949ba59abbe56e057f20f883e | 9ec3811e5ca57e20b51a33b3f0b78f06 |

> **注意**: 此密码仅在首次初始化数据库时生效。如果数据库已存在管理员账户，需要通过后台修改密码或手动更新数据库中的 `ADMIN_PASSWORD` 字段。

---

### 2. 小程序名称修改
**文件**: `miniprogram/app.json`

| 项目 | 原值 | 新值 |
|------|------|------|
| navigationBarTitleText | 校园报修小程序 | 南外家电维修 |

---

### 3. 工作人员分类修改
**文件**: `miniprogram/projects/repair/public/project_setting.js`

| 项目 | 原值 | 新值 |
|------|------|------|
| MEMBER_CATE | 客服部、安保部、保洁部、维修部、工程部 | 客服部、维修部 |

---

### 4. 首页服务商城化改造 ⭐
**改动说明**: 参照啄木鸟平台模式，将首页改造为服务商品展示页面

#### 4.1 首页布局改造
**文件**: 
- `miniprogram/projects/repair/pages/default/index/default_index.wxml`
- `miniprogram/projects/repair/pages/default/index/default_index.wxss`
- `miniprogram/projects/repair/pages/default/index/default_index.js`

**改动内容**:
- 原首页四个功能模块（通知公告、马上报修、我的工单、个人中心）改为服务项目列表
- 服务项目点击后跳转到服务详情页
- 底部导航栏保留原有功能入口

#### 4.2 新增服务详情页
**文件**: 
- `miniprogram/projects/repair/pages/service/detail/service_detail.js`
- `miniprogram/projects/repair/pages/service/detail/service_detail.json`
- `miniprogram/projects/repair/pages/service/detail/service_detail.wxml`
- `miniprogram/projects/repair/pages/service/detail/service_detail.wxss`

**功能**:
- 展示服务价格（上门检测费、维修费用等）
- 展示服务内容列表
- 展示收费标准说明
- 展示温馨提示
- 底部提供"联系客服"和"立即预约"按钮
- **"立即预约"按钮点击后跳转到报修页面，自动填充报修类型，用户无需重复选择**

#### 4.3 服务商品配置
**文件**: `miniprogram/projects/repair/public/project_setting.js`

新增 `SERVICE_PRODUCTS` 配置项，包含以下服务：

| 服务 | 图标 | 说明 |
|------|------|------|
| 电视维修 | 📺 | 电视开机、画面、声音等故障维修 |
| 冰箱维修 | 🧊 | 制冷、漏水、异响等问题维修 |
| 水电维修 | 🔧 | 水管漏水、电路故障、开关插座等 |
| 其他维修 | 🛠️ | 空调、洗衣机、热水器等家电维修 |

#### 4.4 报修页面自动填充功能
**文件**: 
- `miniprogram/projects/repair/pages/task/add/task_add.js`
- `miniprogram/projects/repair/pages/task/add/task_add.wxml`
- `miniprogram/cmpts/public/form/form_show/form_show_cmpt.wxml`
- `miniprogram/cmpts/public/form/form_show/form_show_cmpt.wxss`

**功能说明**:
- 服务详情页点击"立即预约"跳转到报修页面时，携带 `type` 参数
- 报修页面接收参数后，自动将报修类型字段设为只读，并显示对应的服务名称
- 用户无需再选择报修类型，直接填写其他信息即可

---

### 5. 工作人员管理功能实现 ⭐
**文件**: 
- `cloudfunctions/mcloud/project/repair/service/admin/admin_member_service.js`
- `cloudfunctions/mcloud/project/repair/controller/admin/admin_member_controller.js`
- `miniprogram/projects/repair/biz/admin_member_biz.js`

原项目的工作人员管理功能被禁用，现已完整实现以下功能：

| 功能 | 方法 | 说明 |
|------|------|------|
| 添加工作人员 | `insertMember` | 创建新工作人员账号，手机号唯一性校验，返回新创建的ID |
| 编辑工作人员 | `editMember` | 修改工作人员信息，支持修改密码 |
| 删除工作人员 | `delMember` | 删除工作人员记录 |
| 修改状态 | `statusMember` | 启用/停用工作人员账号 |
| 更新表单 | `updateMemberForms` | 更新工作人员扩展表单数据 |

**实现细节**:
- 密码使用 MD5 加密存储
- 手机号唯一性校验
- 支持按部门分类管理
- 修复 `cateId` 校验规则（从 `id` 类型改为 `string` 类型）
- 修复 `insertMember` 返回值问题

---

### 6. 核心业务功能限制移除 ⭐⭐⭐
**改动说明**: 原项目核心业务功能被作者禁用（提示"该功能暂不开放"），现已完整实现所有功能

#### 6.1 报修工单功能
**文件**: `cloudfunctions/mcloud/project/repair/service/task_service.js`

| 功能 | 方法 | 说明 |
|------|------|------|
| 提交报修 | `insertTask` | 用户提交报修工单，状态默认为"待派工" |
| 修改报修 | `editTask` | 修改报修工单信息 |
| 删除报修 | `delTask` | 删除报修工单（支持用户和管理员） |
| 评价报修 | `commentTask` | 用户对已完成的工单进行评价 |

#### 6.2 管理后台-工单管理
**文件**: `cloudfunctions/mcloud/project/repair/service/admin/admin_task_service.js`

| 功能 | 方法 | 说明 |
|------|------|------|
| 派工 | `apptTaskMember` | 将工单分配给指定工作人员 |
| 修改状态 | `statusAdminTask` | 修改工单状态 |
| 导出数据 | `exportTaskDataExcel` | 导出工单数据为Excel |

#### 6.3 工作人员端功能
**文件**: `cloudfunctions/mcloud/project/repair/service/work/work_task_service.js`

| 功能 | 方法 | 说明 |
|------|------|------|
| 开始处理 | `runWorkTask` | 工作人员开始处理工单 |
| 完成处理 | `overWorkTask` | 工作人员完成工单处理 |

**文件**: `cloudfunctions/mcloud/project/repair/service/work/work_home_service.js`

| 功能 | 方法 | 说明 |
|------|------|------|
| 修改密码 | `pwdWork` | 工作人员修改自身密码 |

#### 6.4 管理后台-用户管理
**文件**: `cloudfunctions/mcloud/project/repair/service/admin/admin_user_service.js`

| 功能 | 方法 | 说明 |
|------|------|------|
| 修改状态 | `statusUser` | 修改用户状态（正常/禁用等） |
| 删除用户 | `delUser` | 删除用户记录 |
| 导出数据 | `exportUserDataExcel` | 导出用户数据为Excel |

#### 6.5 管理后台-资讯管理
**文件**: `cloudfunctions/mcloud/project/repair/service/admin/admin_news_service.js`

| 功能 | 方法 | 说明 |
|------|------|------|
| 添加资讯 | `insertNews` | 发布新资讯/公告 |
| 编辑资讯 | `editNews` | 编辑资讯内容 |
| 删除资讯 | `delNews` | 删除资讯 |
| 修改状态 | `statusNews` | 上架/下架资讯 |
| 置顶排序 | `sortNews` | 设置资讯排序 |
| 首页推荐 | `vouchNews` / `vouchNewsSetup` | 设置首页推荐 |
| 更新内容 | `updateNewsContent` | 更新富文本内容 |
| 更新图片 | `updateNewsPic` | 更新封面图片 |
| 更新表单 | `updateNewsForms` | 更新扩展表单数据 |

#### 6.6 管理后台-管理员管理
**文件**: `cloudfunctions/mcloud/project/repair/service/admin/admin_mgr_service.js`

| 功能 | 方法 | 说明 |
|------|------|------|
| 添加管理员 | `insertMgr` | 创建新管理员账号 |
| 编辑管理员 | `editMgr` | 编辑管理员信息 |
| 删除管理员 | `delMgr` | 删除管理员（不能删除自己） |
| 修改状态 | `statusMgr` | 启用/禁用管理员 |
| 修改密码 | `pwdtMgr` | 管理员修改自身密码 |
| 清除日志 | `clearLog` | 清除系统日志 |

**实现细节**:
- 所有密码使用 MD5 加密存储
- 管理员不能删除/禁用自己
- 手机号/用户名唯一性校验
- 数据导出支持自定义字段
- 工单状态流转：待派工 → 已派工 → 处理中 → 已完成

---

### 7. 用户登录系统改造 ⭐⭐
**改动说明**: 完善用户登录体系，支持切换账号、退出登录、微信手机号快捷登录

#### 7.1 用户模型扩展
**文件**: `cloudfunctions/mcloud/project/repair/model/user_model.js`

新增字段：
| 字段 | 类型 | 说明 |
|------|------|------|
| `USER_PASSWORD` | string | 登录密码(MD5加密) |
| `USER_PASSWORD_TIME` | int | 密码设置时间 |

#### 7.2 新增短信验证码模型
**文件**: `cloudfunctions/mcloud/project/repair/model/sms_code_model.js`

用于存储短信验证码记录，支持登录和重置密码场景。

#### 7.3 登录服务扩展
**文件**: `cloudfunctions/mcloud/project/repair/service/passport_service.js`

新增方法：
| 方法 | 说明 |
|------|------|
| `loginByWxPhone` | 微信手机号快捷登录（使用新版API） |
| `loginByPassword` | 手机号+密码登录 |
| `loginBySms` | 手机号+验证码登录 |
| `sendSmsCode` | 发送短信验证码 |
| `setPassword` | 设置密码 |
| `changePassword` | 修改密码 |
| `resetPassword` | 重置密码 |
| `checkMobileRegistered` | 检查手机号是否已注册 |

#### 7.4 新增登录页面
**文件**: 
- `miniprogram/projects/repair/pages/my/login/my_login.js`
- `miniprogram/projects/repair/pages/my/login/my_login.json`
- `miniprogram/projects/repair/pages/my/login/my_login.wxml`
- `miniprogram/projects/repair/pages/my/login/my_login.wxss`

**功能**:
- 微信手机号快捷登录（主要方式）
- 新用户注册入口
- 开发环境提示（真机调试才能获取手机号）

#### 7.5 个人中心改造
**文件**: 
- `miniprogram/projects/repair/pages/my/index/my_index.js`
- `miniprogram/projects/repair/pages/my/index/my_index.wxml`

**新增功能**:
- 切换账号入口
- 退出登录入口
- 登录/注册入口（未登录时显示）
- 未登录状态隐藏工单统计和修改资料入口

#### 7.6 退出登录机制
**文件**: 
- `miniprogram/app.js`
- `miniprogram/comm/constants.js`

**实现细节**:
- 新增 `CACHE_LOGOUT_FLAG` 退出标记
- 退出登录后设置标记，阻止自动登录
- 登录/注册成功后清除标记

#### 7.7 微信手机号API更新
**改动说明**: 微信已废弃旧版 `cloudID` 方式，改用 `code` 方式获取手机号

| 项目 | 旧版API | 新版API |
|------|---------|---------|
| 前端返回 | `e.detail.cloudID` | `e.detail.code` |
| 云函数调用 | `cloud.getOpenData()` | `cloud.openapi.phonenumber.getPhoneNumber()` |

#### 7.8 废弃API修复
**文件**: `miniprogram/app.js`

| 项目 | 旧版API | 新版API |
|------|---------|---------|
| 获取系统信息 | `wx.getSystemInfo()` | `wx.getWindowInfo()` + `wx.getDeviceInfo()` |

---

### 8. 登录方式扩展 ⭐⭐
**改动说明**: 将微信快捷登录改为手机号+密码/验证码登录，支持一个微信绑定多个手机号

#### 8.1 登录页面改造
**文件**: 
- `miniprogram/projects/repair/pages/my/login/my_login.js`
- `miniprogram/projects/repair/pages/my/login/my_login.wxml`
- `miniprogram/projects/repair/pages/my/login/my_login.wxss`

**功能**:
- 支持两种登录方式切换：密码登录、验证码登录
- 密码登录：输入手机号和密码
- 验证码登录：输入手机号和验证码（适合未设置密码的用户）
- 密码错误时提示可切换验证码登录
- 新用户注册入口

#### 8.2 注册页面改造
**文件**: 
- `miniprogram/projects/repair/pages/my/reg/my_reg.js`
- `miniprogram/projects/repair/pages/my/edit/user_form.wxml`

**功能**:
- 新增密码设置字段
- 注册时检查手机号是否已被注册
- 移除自动跳转逻辑（修复点击注册进入"我的"页面的问题）

#### 8.3 新增设置密码页面
**文件**: 
- `miniprogram/projects/repair/pages/my/password/my_password.js`
- `miniprogram/projects/repair/pages/my/password/my_password.json`
- `miniprogram/projects/repair/pages/my/password/my_password.wxml`
- `miniprogram/projects/repair/pages/my/password/my_password.wxss`

**功能**:
- 已注册用户可设置/修改密码
- 设置密码后可用密码登录

#### 8.4 多账号支持 ⭐
**改动说明**: 允许一个微信账号绑定多个手机号账号

**文件**: 
- `cloudfunctions/mcloud/project/repair/service/passport_service.js`
- `miniprogram/app.js`

**实现细节**:
- 注册时不再检查微信号是否已绑定账号
- 一个微信号可以注册多个手机号账号
- 自动登录时，如果只有一个账号则自动登录
- 如果有多个账号，返回账号列表让用户选择
- 登录时通过手机号区分不同账号

#### 8.5 退出登录优化
**文件**: 
- `miniprogram/projects/repair/pages/my/index/my_index.js`
- `miniprogram/comm/biz/passport_biz.js`

**功能**:
- 退出登录后清除所有用户数据
- 退出后访问需要登录的页面会提示先登录
- 工单页面在退出状态不显示任何数据

---

### 9. 数据隔离修复 ⭐⭐⭐
**改动说明**: 修复退出登录后仍能看到订单的问题，确保数据完全隔离

#### 9.1 退出登录时清除所有缓存
**文件**: `miniprogram/comm/biz/passport_biz.js`

**功能**:
- 退出登录时清除所有列表缓存数据
- 清除用户token和退出标记
- 确保不同账号数据完全隔离

#### 9.2 工单页面登录状态检查
**文件**:
- `miniprogram/projects/repair/pages/task/my_list/task_my_list.js`
- `miniprogram/projects/repair/pages/task/index/task_index.js`

**功能**:
- 页面初始化时 isLogin 默认为 false
- 页面显示时检查登录状态
- 未登录时清空 dataList 数据
- 确保只有登录后才加载数据

#### 9.3 退出登录逻辑完善
**文件**: `miniprogram/projects/repair/pages/my/index/my_index.js`

**功能**:
- 使用 PassportBiz.logout() 统一退出登录
- 确保所有缓存数据被清除

#### 8.6 后端登录接口扩展
**文件**: 
- `cloudfunctions/mcloud/project/repair/service/passport_service.js`
- `cloudfunctions/mcloud/project/repair/controller/passport_controller.js`

新增/修改方法：
| 方法 | 说明 |
|------|------|
| `loginByPassword` | 手机号+密码登录 |
| `loginBySms` | 手机号+验证码登录 |
| `loginByMobile` | 通过手机号登录（支持多账号） |
| `autoLoginCheck` | 自动登录检查（支持多账号返回） |
| `register` | 注册（支持密码设置，允许多账号） |
| `setPassword` | 设置密码 |

---

## 改动文件清单

| 序号 | 文件路径 | 改动内容 |
|------|----------|----------|
| 1 | `cloudfunctions/mcloud/project/repair/service/base_project_service.js` | 管理员密码MD5值 |
| 2 | `cloudfunctions/mcloud/project/repair/service/admin/admin_member_service.js` | 实现工作人员管理功能 |
| 3 | `cloudfunctions/mcloud/project/repair/controller/admin/admin_member_controller.js` | 修复cateId校验规则 |
| 4 | `miniprogram/projects/repair/biz/admin_member_biz.js` | 修复cateId校验规则 |
| 5 | `miniprogram/app.json` | 小程序名称、新增服务详情页路径 |
| 6 | `miniprogram/projects/repair/public/project_setting.js` | 工作人员分类、服务商品配置 |
| 7 | `miniprogram/projects/repair/pages/default/index/default_index.wxml` | 首页布局改造 |
| 8 | `miniprogram/projects/repair/pages/default/index/default_index.wxss` | 首页样式改造 |
| 9 | `miniprogram/projects/repair/pages/default/index/default_index.js` | 首页逻辑改造 |
| 10 | `miniprogram/projects/repair/pages/service/detail/service_detail.js` | 新增服务详情页逻辑 |
| 11 | `miniprogram/projects/repair/pages/service/detail/service_detail.json` | 新增服务详情页配置 |
| 12 | `miniprogram/projects/repair/pages/service/detail/service_detail.wxml` | 新增服务详情页模板 |
| 13 | `miniprogram/projects/repair/pages/service/detail/service_detail.wxss` | 新增服务详情页样式 |
| 14 | `miniprogram/projects/repair/pages/task/add/task_add.js` | 报修页面自动填充报修类型 |
| 15 | `miniprogram/projects/repair/pages/task/add/task_add.wxml` | 报修页面表单绑定修改 |
| 16 | `miniprogram/cmpts/public/form/form_show/form_show_cmpt.wxml` | 表单组件支持只读字段 |
| 17 | `miniprogram/cmpts/public/form/form_show/form_show_cmpt.wxss` | 只读字段样式 |
| 18 | `cloudfunctions/mcloud/project/repair/service/task_service.js` | 实现报修工单CRUD功能 |
| 19 | `cloudfunctions/mcloud/project/repair/service/admin/admin_task_service.js` | 实现派工、状态修改、数据导出 |
| 20 | `cloudfunctions/mcloud/project/repair/service/work/work_task_service.js` | 实现工作人员处理工单功能 |
| 21 | `cloudfunctions/mcloud/project/repair/service/work/work_home_service.js` | 实现工作人员修改密码 |
| 22 | `cloudfunctions/mcloud/project/repair/service/admin/admin_user_service.js` | 实现用户管理、数据导出 |
| 23 | `cloudfunctions/mcloud/project/repair/service/admin/admin_news_service.js` | 实现资讯管理完整功能 |
| 24 | `cloudfunctions/mcloud/project/repair/service/admin/admin_mgr_service.js` | 实现管理员管理完整功能 |
| 25 | `miniprogram/projects/repair/pages/my/index/my_index.js` | 隐藏后台入口，改为连续点击5次触发 |
| 26 | `miniprogram/projects/repair/pages/my/index/my_index.wxml` | 移除公开的后台管理入口 |
| 27 | `miniprogram/projects/repair/pages/work/index/home/work_home.js` | 修复退出登录时下拉刷新报错 |
| 28 | `cloudfunctions/mcloud/project/repair/model/user_model.js` | 新增密码字段 |
| 29 | `cloudfunctions/mcloud/project/repair/model/sms_code_model.js` | 新增短信验证码模型 |
| 30 | `cloudfunctions/mcloud/project/repair/service/passport_service.js` | 新增多种登录方式 |
| 31 | `cloudfunctions/mcloud/project/repair/controller/passport_controller.js` | 新增登录接口 |
| 32 | `cloudfunctions/mcloud/project/repair/public/route.js` | 新增路由 |
| 33 | `miniprogram/projects/repair/pages/my/login/my_login.js` | 新增登录页面逻辑 |
| 34 | `miniprogram/projects/repair/pages/my/login/my_login.json` | 新增登录页面配置 |
| 35 | `miniprogram/projects/repair/pages/my/login/my_login.wxml` | 新增登录页面模板 |
| 36 | `miniprogram/projects/repair/pages/my/login/my_login.wxss` | 新增登录页面样式 |
| 37 | `miniprogram/projects/repair/pages/my/index/my_index.js` | 切换账号/退出登录功能 |
| 38 | `miniprogram/projects/repair/pages/my/index/my_index.wxml` | 切换账号/退出登录入口 |
| 39 | `miniprogram/comm/constants.js` | 新增退出登录标记 |
| 40 | `miniprogram/comm/biz/passport_biz.js` | 新增登录方法 |
| 41 | `miniprogram/app.js` | 退出登录检测、废弃API修复、多账号支持 |
| 42 | `miniprogram/projects/repair/pages/my/password/my_password.js` | 新增设置密码页面逻辑 |
| 43 | `miniprogram/projects/repair/pages/my/password/my_password.json` | 新增设置密码页面配置 |
| 44 | `miniprogram/projects/repair/pages/my/password/my_password.wxml` | 新增设置密码页面模板 |
| 45 | `miniprogram/projects/repair/pages/my/password/my_password.wxss` | 新增设置密码页面样式 |
| 46 | `miniprogram/projects/repair/pages/my/edit/user_form.wxml` | 注册表单新增密码字段 |

---

## 角色职责建议

### 客服部职责

| 职责 | 说明 |
|------|------|
| **接单派工** | 接收用户报修订单，根据故障类型分配给合适的维修师傅 |
| **电话沟通** | 接听用户咨询电话，解答维修相关问题 |
| **进度跟踪** | 跟踪维修进度，及时向用户反馈状态 |
| **售后回访** | 维修完成后电话回访，确认用户满意度 |
| **投诉处理** | 处理用户投诉，协调解决问题 |
| **数据统计** | 统计每日/每周工单数据，生成报表 |

**建议功能权限**:
- ✅ 查看所有工单
- ✅ 派工给维修人员
- ✅ 修改工单状态（待派工→已派工）
- ✅ 查看用户联系方式
- ✅ 发布通知公告

---

### 维修部职责

| 职责 | 说明 |
|------|------|
| **上门维修** | 根据派工单上门进行维修服务 |
| **故障诊断** | 现场诊断故障原因，告知用户维修方案和费用 |
| **维修执行** | 执行维修操作，更换配件 |
| **完工确认** | 维修完成后拍照上传，填写维修记录 |
| **费用结算** | 向用户收取维修费用 |
| **配件管理** | 管理维修工具和配件库存 |

**建议功能权限**:
- ✅ 查看分配给自己的工单
- ✅ 更新工单状态（已派工→处理中→已完成）
- ✅ 上传维修照片和说明
- ✅ 填写维修记录
- ❌ 不能查看其他维修人员的工单
- ❌ 不能派工

---

### 工作流程建议

```
用户报修 → 客服接单 → 客服派工 → 维修师傅接单 → 上门维修 → 完工确认 → 客服回访
    ↓           ↓           ↓             ↓            ↓          ↓
  提交工单   确认信息    分配师傅      开始处理      上传照片    满意度调查
```

---

## 待完成的改动建议

### 高优先级

#### 1. 实际收费修改

建议：在师傅上门检查完毕后，把维修所需的实际金额填写在工单的“处理中”的表单中，作为最后实际收费的依据。最后微信支付的金额也按照这个收

#### 2. 首页横幅图片
**文件**: `miniprogram/projects/repair/images/home.jpg`

**建议**: 替换为符合"南外家电维修"品牌形象的图片

#### 3. 底部导航栏图标
**目录**: `miniprogram/projects/repair/images/tabbar/`

**建议**: 根据需要替换图标样式

#### 4. 服务价格调整
**文件**: `miniprogram/projects/repair/public/project_setting.js`

**建议**: 根据实际业务调整 `SERVICE_PRODUCTS` 中的价格、服务内容、收费标准

---

### 中优先级

#### 4. 主题颜色
**文件**: `miniprogram/projects/repair/public/project_setting.js`

当前配置:
```javascript
PROJECT_COLOR: '#0055BE',  // 主题色 (蓝色)
NAV_COLOR: '#ffffff',      // 导航栏文字颜色 (白色)
NAV_BG: '#0055BE',         // 导航栏背景色 (蓝色)
```

**建议**: 根据品牌VI调整颜色

#### 5. 版本信息
**文件**: `miniprogram/setting/setting.js`

当前配置:
```javascript
VER: 'build 2023.10.01',
COMPANY: '联系作者',
```

**建议**: 更新为当前版本号和公司/个人名称

#### 6. 通知公告分类
**文件**: `miniprogram/projects/repair/public/project_setting.js`

当前配置:
```javascript
NEWS_NAME: '通知公告',
NEWS_CATE: [{ id: 1, title: '通知公告', style: 'leftbig1' }]
```

**建议**: 可根据业务需要调整分类，如增加"优惠活动"、"维修知识"等

---

### 低优先级

#### 7. 缓存配置
**文件**: `miniprogram/setting/setting.js`

```javascript
CACHE_IS_LIST: true,       // 列表是否缓存
CACHE_LIST_TIME: 60 * 30,  // 缓存时间(秒)
```

#### 8. Token过期时间
**文件**: `cloudfunctions/mcloud/config/config.js`

```javascript
ADMIN_LOGIN_EXPIRE: 86400,  // 管理员token过期时间(秒) - 24小时
WORK_LOGIN_EXPIRE: 86400,   // 服务者token过期时间(秒) - 24小时
```

#### 9. 内容安全校验
**文件**: `cloudfunctions/mcloud/config/config.js`

```javascript
CLIENT_CHECK_CONTENT: false,  // 前台图片文字校验
ADMIN_CHECK_CONTENT: false,   // 后台图片文字校验
```

**建议**: 如需开启内容安全审核，改为 `true`

---

## 部署注意事项

1. **云函数部署**: 修改云函数后需要在微信开发者工具中重新上传部署云函数
   - 右键点击 `cloudfunctions/mcloud` 文件夹
   - 选择"上传并部署：云端安装依赖"
2. **数据库初始化**: 管理员密码修改仅对新建数据库生效，已有数据库需手动修改
3. **缓存清理**: 建议部署后清理小程序缓存重新编译
4. **服务价格**: 首次使用前请在 `project_setting.js` 中确认并调整服务价格
5. **功能限制移除**: 本次改动移除了原项目的功能限制，需重新部署云函数后才能使用以下功能：
   - 用户报修、修改、删除、评价
   - 管理员派工、状态管理、数据导出
   - 工作人员处理工单、修改密码
   - 用户管理、资讯管理、管理员管理

---

---

### 10. 用户账号体系重构 ⭐⭐⭐
**改动说明**: 重构用户账号体系，仅使用手机号作为唯一标识，移除微信自动绑定和自动登录

#### 10.1 后端登录逻辑重构
**文件**: `cloudfunctions/mcloud/project/repair/service/passport_service.js`

**改动内容**:
- `register`: 注册时不再自动绑定微信号
- `loginByMobile`: 只接受手机号参数，token id 使用手机号
- `loginByPassword`: 移除 openId 参数，不再自动绑定微信号
- `loginBySms`: 移除 openId 参数，不再自动绑定微信号
- `getMyDetail`: 使用手机号查询用户信息
- `editBase`: 使用手机号标识用户，支持修改手机号
- `autoLoginCheck`: 普通用户不再支持自动登录，只保留管理员和工作人员

#### 10.2 后端控制器适配
**文件**: `cloudfunctions/mcloud/project/repair/controller/passport_controller.js`

**改动内容**:
- `getMyDetail`: 使用手机号获取用户信息
- `editBase`: 适配新的参数结构
- `loginByMobile/loginByPassword/loginBySms`: 移除 openId 参数传递

#### 10.3 前端登录逻辑重构
**文件**: `miniprogram/comm/biz/passport_biz.js`

**改动内容**:
- `getUserId()`: 优先从 token.mobile 获取，其次从 token.id 获取
- 保留所有登录方法，移除 openId 相关处理

#### 10.4 前端表单改造
**文件**:
- `miniprogram/projects/repair/pages/my/edit/user_form.wxml`
- `miniprogram/projects/repair/pages/my/edit/my_edit.js`
- `miniprogram/projects/repair/pages/my/reg/my_reg.js`

**改动内容**:
- 移除微信"一键获取/修改手机号"按钮
- 所有用户都直接在输入框填写手机号
- `mobileCheck` 强制设为 false

#### 10.5 自动登录逻辑保留
**文件**: `miniprogram/app.js`

**说明**: 管理员和工作人员仍然保留微信自动登录功能，普通用户必须手动输入手机号+密码/验证码登录

---

## 改动文件清单

| 序号 | 文件路径 | 改动内容 |
|------|----------|----------|
| 1 | `cloudfunctions/mcloud/project/repair/service/base_project_service.js` | 管理员密码MD5值 |
| 2 | `cloudfunctions/mcloud/project/repair/service/admin/admin_member_service.js` | 实现工作人员管理功能 |
| 3 | `cloudfunctions/mcloud/project/repair/controller/admin/admin_member_controller.js` | 修复cateId校验规则 |
| 4 | `miniprogram/projects/repair/biz/admin_member_biz.js` | 修复cateId校验规则 |
| 5 | `miniprogram/app.json` | 小程序名称、新增服务详情页路径 |
| 6 | `miniprogram/projects/repair/public/project_setting.js` | 工作人员分类、服务商品配置 |
| 7 | `miniprogram/projects/repair/pages/default/index/default_index.wxml` | 首页布局改造 |
| 8 | `miniprogram/projects/repair/pages/default/index/default_index.wxss` | 首页样式改造 |
| 9 | `miniprogram/projects/repair/pages/default/index/default_index.js` | 首页逻辑改造 |
| 10 | `miniprogram/projects/repair/pages/service/detail/service_detail.js` | 新增服务详情页逻辑 |
| 11 | `miniprogram/projects/repair/pages/service/detail/service_detail.json` | 新增服务详情页配置 |
| 12 | `miniprogram/projects/repair/pages/service/detail/service_detail.wxml` | 新增服务详情页模板 |
| 13 | `miniprogram/projects/repair/pages/service/detail/service_detail.wxss` | 新增服务详情页样式 |
| 14 | `miniprogram/projects/repair/pages/task/add/task_add.js` | 报修页面自动填充报修类型 |
| 15 | `miniprogram/projects/repair/pages/task/add/task_add.wxml` | 报修页面表单绑定修改 |
| 16 | `miniprogram/cmpts/public/form/form_show/form_show_cmpt.wxml` | 表单组件支持只读字段 |
| 17 | `miniprogram/cmpts/public/form/form_show/form_show_cmpt.wxss` | 只读字段样式 |
| 18 | `cloudfunctions/mcloud/project/repair/service/task_service.js` | 实现报修工单CRUD功能 |
| 19 | `cloudfunctions/mcloud/project/repair/service/admin/admin_task_service.js` | 实现派工、状态修改、数据导出 |
| 20 | `cloudfunctions/mcloud/project/repair/service/work/work_task_service.js` | 实现工作人员处理工单功能 |
| 21 | `cloudfunctions/mcloud/project/repair/service/work/work_home_service.js` | 实现工作人员修改密码 |
| 22 | `cloudfunctions/mcloud/project/repair/service/admin/admin_user_service.js` | 实现用户管理、数据导出 |
| 23 | `cloudfunctions/mcloud/project/repair/service/admin/admin_news_service.js` | 实现资讯管理完整功能 |
| 24 | `cloudfunctions/mcloud/project/repair/service/admin/admin_mgr_service.js` | 实现管理员管理完整功能 |
| 25 | `miniprogram/projects/repair/pages/my/index/my_index.js` | 隐藏后台入口，改为连续点击5次触发 |
| 26 | `miniprogram/projects/repair/pages/my/index/my_index.wxml` | 移除公开的后台管理入口 |
| 27 | `miniprogram/projects/repair/pages/work/index/home/work_home.js` | 修复退出登录时下拉刷新报错 |
| 28 | `cloudfunctions/mcloud/project/repair/model/user_model.js` | 新增密码字段 |
| 29 | `cloudfunctions/mcloud/project/repair/model/sms_code_model.js` | 新增短信验证码模型 |
| 30 | `cloudfunctions/mcloud/project/repair/service/passport_service.js` | 新增多种登录方式 |
| 31 | `cloudfunctions/mcloud/project/repair/controller/passport_controller.js` | 新增登录接口 |
| 32 | `cloudfunctions/mcloud/project/repair/public/route.js` | 新增路由 |
| 33 | `miniprogram/projects/repair/pages/my/login/my_login.js` | 新增登录页面逻辑 |
| 34 | `miniprogram/projects/repair/pages/my/login/my_login.json` | 新增登录页面配置 |
| 35 | `miniprogram/projects/repair/pages/my/login/my_login.wxml` | 新增登录页面模板 |
| 36 | `miniprogram/projects/repair/pages/my/login/my_login.wxss` | 新增登录页面样式 |
| 37 | `miniprogram/projects/repair/pages/my/index/my_index.js` | 切换账号/退出登录功能 |
| 38 | `miniprogram/projects/repair/pages/my/index/my_index.wxml` | 切换账号/退出登录入口 |
| 39 | `miniprogram/comm/constants.js` | 新增退出登录标记 |
| 40 | `miniprogram/comm/biz/passport_biz.js` | 新增登录方法 |
| 41 | `miniprogram/app.js` | 退出登录检测、废弃API修复、多账号支持 |
| 42 | `miniprogram/projects/repair/pages/my/password/my_password.js` | 新增设置密码页面逻辑 |
| 43 | `miniprogram/projects/repair/pages/my/password/my_password.json` | 新增设置密码页面配置 |
| 44 | `miniprogram/projects/repair/pages/my/password/my_password.wxml` | 新增设置密码页面模板 |
| 45 | `miniprogram/projects/repair/pages/my/password/my_password.wxss` | 新增设置密码页面样式 |
| 46 | `miniprogram/projects/repair/pages/my/edit/user_form.wxml` | 注册表单新增密码字段 |
| 47 | `miniprogram/comm/biz/passport_biz.js` | 退出登录时清除列表缓存 |
| 48 | `miniprogram/projects/repair/pages/task/my_list/task_my_list.js` | isLogin默认为false，onShow检查登录状态 |
| 49 | `miniprogram/projects/repair/pages/task/index/task_index.js` | isLogin默认为false，onShow检查登录状态 |
| 50 | `cloudfunctions/mcloud/project/repair/service/passport_service.js` | 用户账号体系重构，移除微信自动绑定 |
| 51 | `cloudfunctions/mcloud/project/repair/controller/passport_controller.js` | 控制器适配新的用户标识逻辑 |
| 52 | `miniprogram/projects/repair/pages/my/edit/user_form.wxml` | 移除微信获取手机号按钮 |
| 53 | `miniprogram/projects/repair/pages/my/edit/my_edit.js` | mobileCheck设为false |
| 54 | `miniprogram/projects/repair/pages/my/reg/my_reg.js` | mobileCheck设为false |

---

### 11. 维修报价确认流程 ⭐⭐⭐
**改动说明**: 新增维修报价提交和用户确认流程，用户确认报价后才进入处理中状态

#### 11.1 数据库模型扩展
**文件**: `cloudfunctions/mcloud/project/repair/model/task_model.js`

新增字段：
| 字段 | 类型 | 说明 |
|------|------|------|
| `TASK_QUOTE_FORMS` | array | 报价表单 |
| `TASK_QUOTE_OBJ` | object | 报价对象 |
| `TASK_QUOTE_TIME` | int | 报价时间 |
| `TASK_QUOTE_CONFIRM` | int | 报价确认状态(0=待确认,1=已确认,2=已取消) |

状态调整：
| 状态码 | 原含义 | 新含义 |
|--------|--------|--------|
| 0 | 待派工 | 待派工 |
| 1 | 已派工 | 已派工 |
| 2 | 处理中 | 待用户确认报价 |
| 3 | - | 处理中 |
| 9 | 已完成 | 已完成 |
| 10 | - | 已取消 |

#### 11.2 报价表单配置
**文件**: `miniprogram/projects/repair/public/project_setting.js`

新增 `TASK_QUOTE_FIELDS` 配置：
```javascript
TASK_QUOTE_FIELDS: [
    { mark: 'chargeDesc', title: '收费情况说明', type: 'textarea', must: true },
    { mark: 'chargeAmount', title: '收费金额(元)', type: 'digit', must: true },
    { mark: 'content', title: '情况说明', type: 'textarea', must: false },
    { mark: 'img', type: 'image', title: '相关图片', max: 8 },
],
```

#### 11.3 后端服务层新增方法
**文件**: `cloudfunctions/mcloud/project/repair/service/work/work_task_service.js`

| 方法 | 说明 |
|------|------|
| `quoteWorkTask` | 维修人员提交报价 |

**文件**: `cloudfunctions/mcloud/project/repair/service/task_service.js`

| 方法 | 说明 |
|------|------|
| `confirmQuote` | 用户确认报价，状态变为处理中 |
| `cancelQuote` | 用户取消报价，状态变为已取消 |

#### 11.4 后端控制器新增接口
**文件**: `cloudfunctions/mcloud/project/repair/controller/work/work_task_controller.js`

| 接口 | 说明 |
|------|------|
| `quoteWorkTask` | 提交报价 |
| `updateWorkQuoteTaskForms` | 更新报价表单图片 |

**文件**: `cloudfunctions/mcloud/project/repair/controller/task_controller.js`

| 接口 | 说明 |
|------|------|
| `confirmQuote` | 用户确认报价 |
| `cancelQuote` | 用户取消报价 |

#### 11.5 路由配置
**文件**: `cloudfunctions/mcloud/project/repair/public/route.js`

新增路由：
```javascript
'work/task_quote': 'work/work_task_controller@quoteWorkTask',
'work/task_update_quote_forms': 'work/work_task_controller@updateWorkQuoteTaskForms',
'task/confirm_quote': 'task_controller@confirmQuote',
'task/cancel_quote': 'task_controller@cancelQuote',
```

#### 11.6 维修人员端改造
**新增报价页面**:
- `miniprogram/projects/repair/pages/work/task/quote/work_task_quote.js`
- `miniprogram/projects/repair/pages/work/task/quote/work_task_quote.json`
- `miniprogram/projects/repair/pages/work/task/quote/work_task_quote.wxml`
- `miniprogram/projects/repair/pages/work/task/quote/work_task_quote.wxss`

**工单列表筛选菜单更新**:
- 全部
- 待处理 (状态1)
- 待确认 (状态2) ← 新增
- 处理中 (状态3)
- 已完成 (状态9)

**工单详情页操作按钮**:
- 状态1：显示"提交报价"按钮
- 状态2：显示"等待用户确认报价"（禁用状态）
- 状态3：显示"设为完成"按钮

#### 11.7 用户端改造
**工单列表状态显示**:
- 新增"待您确认报价"状态（黄色标签）
- 新增"已取消"状态（灰色标签）

**工单详情页**:
- 状态2时显示报价信息卡片（收费情况说明、收费金额、其他说明、相关图片）
- 状态2时显示"确认维修"和"取消维修"按钮
- 状态>=2时显示报价信息
- 状态>=3时显示维修完成信息

**筛选菜单更新**:
- 全部
- 待派工
- 已派工待处理
- 待确认报价 ← 新增
- 处理中
- 已完成
- 已取消 ← 新增

#### 11.8 处理流程日志更新
**文件**: `cloudfunctions/mcloud/project/repair/service/task_service.js`

`getTaskLogList` 方法新增报价记录显示：
- 显示收费情况说明
- 显示收费金额
- 显示确认状态（待用户确认/用户已确认/用户已取消）

#### 11.9 工单统计更新
**文件**: `cloudfunctions/mcloud/project/repair/service/task_service.js`

`getTaskCountByType` 方法新增状态10（已取消）的统计。

---

## 改动文件清单

| 序号 | 文件路径 | 改动内容 |
|------|----------|----------|
| 1 | `cloudfunctions/mcloud/project/repair/service/base_project_service.js` | 管理员密码MD5值 |
| 2 | `cloudfunctions/mcloud/project/repair/service/admin/admin_member_service.js` | 实现工作人员管理功能 |
| 3 | `cloudfunctions/mcloud/project/repair/controller/admin/admin_member_controller.js` | 修复cateId校验规则 |
| 4 | `miniprogram/projects/repair/biz/admin_member_biz.js` | 修复cateId校验规则 |
| 5 | `miniprogram/app.json` | 小程序名称、新增服务详情页路径、新增报价页面路径 |
| 6 | `miniprogram/projects/repair/public/project_setting.js` | 工作人员分类、服务商品配置、报价表单配置 |
| 7 | `miniprogram/projects/repair/pages/default/index/default_index.wxml` | 首页布局改造 |
| 8 | `miniprogram/projects/repair/pages/default/index/default_index.wxss` | 首页样式改造 |
| 9 | `miniprogram/projects/repair/pages/default/index/default_index.js` | 首页逻辑改造 |
| 10 | `miniprogram/projects/repair/pages/service/detail/service_detail.js` | 新增服务详情页逻辑 |
| 11 | `miniprogram/projects/repair/pages/service/detail/service_detail.json` | 新增服务详情页配置 |
| 12 | `miniprogram/projects/repair/pages/service/detail/service_detail.wxml` | 新增服务详情页模板 |
| 13 | `miniprogram/projects/repair/pages/service/detail/service_detail.wxss` | 新增服务详情页样式 |
| 14 | `miniprogram/projects/repair/pages/task/add/task_add.js` | 报修页面自动填充报修类型 |
| 15 | `miniprogram/projects/repair/pages/task/add/task_add.wxml` | 报修页面表单绑定修改 |
| 16 | `miniprogram/cmpts/public/form/form_show/form_show_cmpt.wxml` | 表单组件支持只读字段 |
| 17 | `miniprogram/cmpts/public/form/form_show/form_show_cmpt.wxss` | 只读字段样式 |
| 18 | `cloudfunctions/mcloud/project/repair/service/task_service.js` | 实现报修工单CRUD功能、报价确认/取消、流程日志更新、统计更新 |
| 19 | `cloudfunctions/mcloud/project/repair/service/admin/admin_task_service.js` | 实现派工、状态修改、数据导出 |
| 20 | `cloudfunctions/mcloud/project/repair/service/work/work_task_service.js` | 实现工作人员处理工单功能、提交报价 |
| 21 | `cloudfunctions/mcloud/project/repair/service/work/work_home_service.js` | 实现工作人员修改密码 |
| 22 | `cloudfunctions/mcloud/project/repair/service/admin/admin_user_service.js` | 实现用户管理、数据导出 |
| 23 | `cloudfunctions/mcloud/project/repair/service/admin/admin_news_service.js` | 实现资讯管理完整功能 |
| 24 | `cloudfunctions/mcloud/project/repair/service/admin/admin_mgr_service.js` | 实现管理员管理完整功能 |
| 25 | `miniprogram/projects/repair/pages/my/index/my_index.js` | 隐藏后台入口，改为连续点击5次触发 |
| 26 | `miniprogram/projects/repair/pages/my/index/my_index.wxml` | 移除公开的后台管理入口 |
| 27 | `miniprogram/projects/repair/pages/work/index/home/work_home.js` | 修复退出登录时下拉刷新报错 |
| 28 | `cloudfunctions/mcloud/project/repair/model/user_model.js` | 新增密码字段 |
| 29 | `cloudfunctions/mcloud/project/repair/model/sms_code_model.js` | 新增短信验证码模型 |
| 30 | `cloudfunctions/mcloud/project/repair/service/passport_service.js` | 新增多种登录方式 |
| 31 | `cloudfunctions/mcloud/project/repair/controller/passport_controller.js` | 新增登录接口 |
| 32 | `cloudfunctions/mcloud/project/repair/public/route.js` | 新增路由（报价、确认、取消） |
| 33 | `miniprogram/projects/repair/pages/my/login/my_login.js` | 新增登录页面逻辑 |
| 34 | `miniprogram/projects/repair/pages/my/login/my_login.json` | 新增登录页面配置 |
| 35 | `miniprogram/projects/repair/pages/my/login/my_login.wxml` | 新增登录页面模板 |
| 36 | `miniprogram/projects/repair/pages/my/login/my_login.wxss` | 新增登录页面样式 |
| 37 | `miniprogram/projects/repair/pages/my/index/my_index.js` | 切换账号/退出登录功能 |
| 38 | `miniprogram/projects/repair/pages/my/index/my_index.wxml` | 切换账号/退出登录入口 |
| 39 | `miniprogram/comm/constants.js` | 新增退出登录标记 |
| 40 | `miniprogram/comm/biz/passport_biz.js` | 新增登录方法 |
| 41 | `miniprogram/app.js` | 退出登录检测、废弃API修复、多账号支持 |
| 42 | `miniprogram/projects/repair/pages/my/password/my_password.js` | 新增设置密码页面逻辑 |
| 43 | `miniprogram/projects/repair/pages/my/password/my_password.json` | 新增设置密码页面配置 |
| 44 | `miniprogram/projects/repair/pages/my/password/my_password.wxml` | 新增设置密码页面模板 |
| 45 | `miniprogram/projects/repair/pages/my/password/my_password.wxss` | 新增设置密码页面样式 |
| 46 | `miniprogram/projects/repair/pages/my/edit/user_form.wxml` | 注册表单新增密码字段 |
| 47 | `miniprogram/comm/biz/passport_biz.js` | 退出登录时清除列表缓存 |
| 48 | `miniprogram/projects/repair/pages/task/my_list/task_my_list.js` | isLogin默认为false，onShow检查登录状态，筛选菜单更新 |
| 49 | `miniprogram/projects/repair/pages/task/index/task_index.js` | isLogin默认为false，onShow检查登录状态 |
| 50 | `cloudfunctions/mcloud/project/repair/service/passport_service.js` | 用户账号体系重构，移除微信自动绑定 |
| 51 | `cloudfunctions/mcloud/project/repair/controller/passport_controller.js` | 控制器适配新的用户标识逻辑 |
| 52 | `miniprogram/projects/repair/pages/my/edit/user_form.wxml` | 移除微信获取手机号按钮 |
| 53 | `miniprogram/projects/repair/pages/my/edit/my_edit.js` | mobileCheck设为false |
| 54 | `miniprogram/projects/repair/pages/my/reg/my_reg.js` | mobileCheck设为false |
| 55 | `cloudfunctions/mcloud/project/repair/model/task_model.js` | 新增报价字段、取消状态 |
| 56 | `cloudfunctions/mcloud/project/repair/controller/work/work_task_controller.js` | 新增报价接口 |
| 57 | `cloudfunctions/mcloud/project/repair/controller/task_controller.js` | 新增确认/取消报价接口 |
| 58 | `miniprogram/projects/repair/pages/work/task/quote/work_task_quote.js` | 新增报价页面逻辑 |
| 59 | `miniprogram/projects/repair/pages/work/task/quote/work_task_quote.json` | 新增报价页面配置 |
| 60 | `miniprogram/projects/repair/pages/work/task/quote/work_task_quote.wxml` | 新增报价页面模板 |
| 61 | `miniprogram/projects/repair/pages/work/task/quote/work_task_quote.wxss` | 新增报价页面样式 |
| 62 | `miniprogram/projects/repair/pages/work/task/list/work_task_list.js` | 筛选菜单更新 |
| 63 | `miniprogram/projects/repair/pages/work/task/detail/work_task_detail.wxml` | 操作按钮根据状态显示 |
| 64 | `miniprogram/projects/repair/pages/task/my_list/task_my_list.wxml` | 状态显示更新 |
| 65 | `miniprogram/projects/repair/pages/task/edit/task_edit.wxml` | 报价信息显示、确认/取消按钮 |
| 66 | `miniprogram/projects/repair/pages/task/edit/task_edit.js` | 确认/取消报价逻辑 |
| 67 | `miniprogram/projects/repair/pages/admin/task/list/task_list_inc.wxml` | 状态显示更新 |
| 68 | `miniprogram/projects/repair/pages/admin/task/detail/task_detail_inc.wxml` | 状态显示更新 |

---

*文档创建时间: 2026-02-20*  
*最后更新时间: 2026-02-22*
