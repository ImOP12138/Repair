const pageHelper = require('../../../../../helper/page_helper.js');
const helper = require('../../../../../helper/helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
const cacheHelper = require('../../../../../helper/cache_helper.js');
const constants = require('../../../../../comm/constants.js');

Page({
	data: {
		isLoad: true,
		mobile: '',
		password: '',
		code: '',
		loginType: 'password',
		sending: false,
		sendText: '发送验证码'
	},

	onLoad: async function (options) {
		ProjectBiz.initPage(this);
		PassportBiz.clearToken();
	},

	onShow: function () { },

	url: function (e) {
		pageHelper.url(e, this);
	},

	bindMobileInput: function (e) {
		this.setData({
			mobile: e.detail.value
		});
	},

	bindPasswordInput: function (e) {
		this.setData({
			password: e.detail.value
		});
	},

	bindCodeInput: function (e) {
		this.setData({
			code: e.detail.value
		});
	},

	switchLoginType: function (e) {
		let type = e.currentTarget.dataset.type;
		this.setData({
			loginType: type
		});
	},

	sendCode: async function () {
		if (this.data.sending) return;
		
		let mobile = this.data.mobile;
		if (!mobile || mobile.length !== 11) {
			wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
			return;
		}

		this.setData({ sending: true, sendText: '发送中...' });

		try {
			let params = { mobile, type: 'login' };
			await cloudHelper.callCloudSumbit('passport/send_sms_code', params);
			
			wx.showToast({ title: '验证码已发送', icon: 'success' });
			
			let count = 60;
			let timer = setInterval(() => {
				count--;
				if (count <= 0) {
					clearInterval(timer);
					this.setData({ sending: false, sendText: '发送验证码' });
				} else {
					this.setData({ sending: false, sendText: `${count}秒后重发` });
				}
			}, 1000);
		} catch (err) {
			this.setData({ sending: false, sendText: '发送验证码' });
			wx.showToast({ title: err.msg || '发送失败', icon: 'none' });
		}
	},

	bindLoginTap: async function (e) {
		let mobile = this.data.mobile;
		let loginType = this.data.loginType;

		if (!mobile || mobile.length !== 11) {
			wx.showToast({ title: '请输入正确的11位手机号', icon: 'none' });
			return;
		}

		try {
			wx.showLoading({ title: '登录中...', mask: true });

			let params, result;

			if (loginType === 'password') {
				let password = this.data.password;
				if (!password || password.length < 6) {
					wx.hideLoading();
					wx.showToast({ title: '密码长度不能少于6位', icon: 'none' });
					return;
				}
				params = { mobile, password };
				result = await cloudHelper.callCloudSumbit('passport/login_by_password', params);
			} else {
				let code = this.data.code;
				if (!code || code.length !== 6) {
					wx.hideLoading();
					wx.showToast({ title: '请输入6位验证码', icon: 'none' });
					return;
				}
				params = { mobile, code };
				result = await cloudHelper.callCloudSumbit('passport/login_by_sms', params);
			}

			wx.hideLoading();

			if (result && result.data.token) {
				cacheHelper.remove(constants.CACHE_LOGOUT_FLAG);
				PassportBiz.setToken(result.data.token);
				wx.showToast({ title: '登录成功', icon: 'success' });
				setTimeout(() => {
					wx.reLaunch({
						url: pageHelper.fmtURLByPID('/pages/my/index/my_index'),
					});
				}, 1000);
			}
		} catch (err) {
			wx.hideLoading();
			console.error(err);
			
			if (err && err.msg) {
				// 密码错误时提示可以切换到验证码登录
				if (loginType === 'password' && err.msg.includes('密码错误')) {
					wx.showModal({
						title: '登录失败',
						content: '密码错误，是否改用验证码登录？',
						confirmText: '切换验证登录',
						cancelText: '取消',
						success: (res) => {
							if (res.confirm) {
								this.setData({ loginType: 'sms' });
							}
						}
					});
				} else {
					wx.showToast({ title: err.msg, icon: 'none' });
				}
			} else {
				wx.showToast({ title: '登录失败，请重试', icon: 'none' });
			}
		}
	},

	bindRegTap: function (e) {
		wx.reLaunch({
			url: pageHelper.fmtURLByPID('/pages/my/reg/my_reg'),
		});
	},

	bindBackTap: function (e) {
		wx.reLaunch({
			url: pageHelper.fmtURLByPID('/pages/default/index/default_index'),
		});
	}
})
