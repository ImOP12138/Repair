const setting = require('./setting/setting.js');
const cloudHelper = require('./helper/cloud_helper.js');
const cacheHelper = require('./helper/cache_helper.js');
const constants = require('./comm/constants.js');

const PID = 'repair';

App({
	onLaunch: async function (options) {

		if (!wx.cloud) {
			console.error('请使用 2.2.3 或以上的基础库以使用云能力')
		} else {
			wx.cloud.init({
				env: setting.CLOUD_ID,
				traceUser: true,
			})
		}

		this.globalData = {};

		// 清除退出登录标记（每次启动都尝试自动登录）
		cacheHelper.remove(constants.CACHE_LOGOUT_FLAG);

		// 用于自定义导航栏
		try {
			const systemInfo = wx.getWindowInfo();
			const deviceInfo = wx.getDeviceInfo();
			this.globalData.statusBarHeight = systemInfo.statusBarHeight;
			
			let capsule = wx.getMenuButtonBoundingClientRect();
			if (capsule) { 
				this.globalData.customBarHeight = capsule.bottom + capsule.top - systemInfo.statusBarHeight;
				this.globalData.capsule = capsule;
			} else {
				this.globalData.customBarHeight = systemInfo.statusBarHeight + 50;
			}
		} catch (e) {
			console.error('获取系统信息失败:', e);
			this.globalData.statusBarHeight = 20;
			this.globalData.customBarHeight = 70;
		}

		// 自动登录检查（带超时处理）
		this.autoLoginCheckWithTimeout();
	},

	autoLoginCheckWithTimeout: function () {
		const timeout = 5000;  // 5秒超时
		let completed = false;

		const timer = setTimeout(() => {
			if (!completed) {
				completed = true;
				console.log('自动登录超时，跳过');
			}
		}, timeout);

		this.autoLoginCheck().finally(() => {
			if (!completed) {
				completed = true;
				clearTimeout(timer);
			}
		});
	},

	autoLoginCheck: async function () {
		if (cacheHelper.get(constants.CACHE_LOGOUT_FLAG)) {
			console.log('用户已退出登录，跳过自动登录');
			return;
		}

		try {
			console.log('开始自动登录检查...');
			
			let res = await new Promise((resolve, reject) => {
				wx.cloud.callFunction({
					name: 'mcloud',
					data: {
						route: 'passport/auto_login_check',
						token: '',
						PID: PID,
						params: {}
					},
					success: (res) => {
						resolve(res.result);
					},
					fail: (err) => {
						console.error('云函数调用失败:', err);
						reject(err);
					}
				});
			});
			
			console.log('自动登录结果:', res);
			
			if (!res) {
				console.log('无返回数据');
				return;
			}
			
			// 处理错误返回
			if (res.ret && res.ret.errCode !== 0) {
				console.log('自动登录返回错误:', res.ret.msg);
				return;
			}
			
			let data = res.data;
			if (!data) {
				console.log('无data数据');
				return;
			}
			console.log('角色:', data.role);

			if (data.role === 'admin') {
				console.log('自动登录管理员');
				cacheHelper.set(constants.CACHE_ADMIN, {
					token: data.token,
					name: data.name,
					type: data.type
				}, constants.ADMIN_TOKEN_EXPIRE);
				
				wx.reLaunch({
					url: '/projects/repair/pages/admin/index/home/admin_home',
				});
			} else if (data.role === 'member') {
				console.log('自动登录工作人员');
				cacheHelper.set(constants.CACHE_WORK, {
					id: data.id,
					token: data.token,
					name: data.name,
					cateId: data.cateId,
					cateName: data.cateName
				}, constants.WORK_TOKEN_EXPIRE);
				
				wx.reLaunch({
					url: '/projects/repair/pages/work/index/home/work_home',
				});
			} else if (data.role === 'user') {
				console.log('自动登录用户');
				cacheHelper.set(constants.CACHE_TOKEN, {
					id: data.id,
					key: data.key,
					name: data.name,
					mobile: data.mobile,
					status: data.status
				}, constants.TOKEN_EXPIRE);
			} else if (data.role === 'user_select') {
				console.log('用户有多个账号，需要选择');
				cacheHelper.set('CACHE_MULTI_ACCOUNTS', data.accounts, 3600);
			} else {
				console.log('未绑定任何账号');
			}
		} catch (err) {
			console.log('自动登录检查错误:', err);
		}
	},
	 
})