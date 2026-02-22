/** 
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2020-10-29 07:48:00 
 */

const cacheHelper = require('../../../../../helper/cache_helper.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const AdminBiz = require('../../../../../comm/biz/admin_biz.js');
const setting = require('../../../../../setting/setting.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
const constants = require('../../../../../comm/constants.js');

Page({
	data: {
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		if (PassportBiz.isLogin()) {
			let user = {};
			user.USER_NAME = PassportBiz.getUserName();
			this.setData({ user });
		}

		ProjectBiz.initPage(this);

	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () { },

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: async function () {
		if (cacheHelper.get(constants.CACHE_LOGOUT_FLAG)) {
			this.setData({
				user: null,
				task: null,
				isLogin: false
			});
			return;
		}

		await PassportBiz.loginSilenceMust(this);
		this._loadUser();

		if (this.data.isLogin) {
			this._loadMyTaskTypeCount();
		}
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {
		wx.stopPullDownRefresh();
	},

	_loadMyTaskTypeCount: async function (e) {

		let opts = {
			title: 'bar'
		}
		let task = await cloudHelper.callCloudData('task/my_type_count', {}, opts);
		if (!task) return;

		this.setData({
			task
		})
	},

	_loadUser: async function (e) {

		let opts = {
			title: 'bar'
		}
		let user = await cloudHelper.callCloudData('passport/my_detail', {}, opts);
		if (!user) {
			this.setData({
				user: null
			});
			return;
		}

		this.setData({
			user
		})
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: async function () {
		this._loadUser();
		this._loadMyTaskTypeCount();
		wx.stopPullDownRefresh();
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},


	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () { },

	url: function (e) {
		pageHelper.url(e, this);
	},

	bindSecretTap: function (e) {
		let touchCount = this.data.touchCount || 0;
		touchCount++;
		
		if (touchCount >= 5) {
			this.setData({ touchCount: 0 });
			wx.showActionSheet({
				itemList: ['后台管理', '工作人员平台', '微信验证登录后台', '微信验证登录工作人员'],
				success: async res => {
					let idx = res.tapIndex;
					if (idx == 0) {
						wx.reLaunch({
							url: '../../admin/index/login/admin_login',
						});
					}
					if (idx == 1) {
						wx.reLaunch({
							url: '../../work/index/login/work_login',
						});
					}
					if (idx == 2) {
						this.doWxLoginAdmin();
					}
					if (idx == 3) {
						this.doWxLoginWork();
					}
				}
			});
		} else {
			this.setData({ touchCount });
			if (touchCount >= 3) {
				wx.showToast({
					title: `再按${5 - touchCount}次进入管理`,
					icon: 'none'
				});
			}
		}
	},

	doWxLoginAdmin: async function () {
		try {
			wx.showLoading({ title: '验证中...' });
			let res = await cloudHelper.callCloudData('admin/login_by_wx', {});
			wx.hideLoading();
			
			if (res && res.success) {
				const AdminBiz = require('../../../../../comm/biz/admin_biz.js');
				AdminBiz.setAdminToken(res.token, res.name, res.type);
				wx.showToast({ title: '登录成功', icon: 'success' });
				setTimeout(() => {
					wx.reLaunch({
						url: '../../admin/index/home/admin_home',
					});
				}, 1000);
			} else {
				wx.showModal({
					title: '提示',
					content: res.msg || '该微信号未绑定管理员账号，请先在后台绑定微信号',
					showCancel: false
				});
			}
		} catch (err) {
			wx.hideLoading();
			console.log(err);
			wx.showToast({ title: '登录失败', icon: 'none' });
		}
	},

	doWxLoginWork: async function () {
		try {
			wx.showLoading({ title: '验证中...' });
			let res = await cloudHelper.callCloudData('work/login_by_wx', {});
			wx.hideLoading();
			
			if (res && res.success) {
				const WorkBiz = require('../../../../biz/work_biz.js');
				WorkBiz.setWorkToken(res.id, res.token, res.name, res.cateId, res.cateName);
				wx.showToast({ title: '登录成功', icon: 'success' });
				setTimeout(() => {
					wx.reLaunch({
						url: '../../work/index/home/work_home',
					});
				}, 1000);
			} else {
				wx.showModal({
					title: '提示',
					content: res.msg || '该微信号未绑定工作人员账号，请先在工作平台绑定微信号',
					showCancel: false
				});
			}
		} catch (err) {
			wx.hideLoading();
			console.log(err);
			wx.showToast({ title: '登录失败', icon: 'none' });
		}
	},

	doQrLogin: async function () {
		try {
			let res = await wx.scanCode({
				scanType: ['barCode', 'qrCode']
			});
			
			let code = res.result;
			if (code && code.length === 8) {
				wx.showLoading({ title: '验证登录码...' });
				
				let checkRes = await cloudHelper.callCloudData('admin/qr_login_check', { code });
				wx.hideLoading();
				
				if (checkRes.status === 'confirmed') {
					const AdminBiz = require('../../../../../comm/biz/admin_biz.js');
					AdminBiz.setAdminToken(checkRes.token, checkRes.name, checkRes.type);
					wx.showToast({ title: '登录成功', icon: 'success' });
					setTimeout(() => {
						wx.reLaunch({
							url: '../../admin/index/home/admin_home',
						});
					}, 1000);
				} else {
					wx.showToast({ title: checkRes.msg || '登录失败', icon: 'none' });
				}
			} else {
				wx.showToast({ title: '无效的登录码', icon: 'none' });
			}
		} catch (err) {
			console.log(err);
		}
	},

	bindSwitchAccount: function () {
		wx.showModal({
			title: '提示',
			content: '确定要切换账号吗？',
			success: (res) => {
				if (res.confirm) {
					PassportBiz.logout();
					cacheHelper.set(constants.CACHE_LOGOUT_FLAG, true, 86400 * 30);
					wx.reLaunch({
						url: '../login/my_login',
					});
				}
			}
		});
	},

	bindLogout: function () {
		wx.showModal({
			title: '提示',
			content: '确定要退出登录吗？',
			success: (res) => {
				if (res.confirm) {
					PassportBiz.logout();
					cacheHelper.set(constants.CACHE_LOGOUT_FLAG, true, 86400 * 30);
					this.setData({
						user: null,
						task: null,
						isLogin: false
					});
					wx.showToast({ title: '已退出登录', icon: 'success' });
					setTimeout(() => {
						wx.reLaunch({
							url: '../../default/index/default_index',
						});
					}, 1000);
				}
			}
		});
	},

	bindGoLogin: function () {
		cacheHelper.set(constants.CACHE_LOGOUT_FLAG, true, 86400 * 30);
		this.setData({
			user: null,
			task: null,
			isLogin: false
		});
		wx.reLaunch({
			url: '../login/my_login',
		});
	},
})