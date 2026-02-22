/**
 * Notes: 注册登录模块业务逻辑
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2020-11-14 07:48:00 
 */

const BaseBiz = require('./base_biz.js');
const cacheHelper = require('../../helper/cache_helper.js');
const cloudHelper = require('../../helper/cloud_helper.js');
const pageHelper = require('../../helper/page_helper.js');
const helper = require('../../helper/helper.js');
const constants = require('../constants.js');
const PublicBiz = require('./public_biz.js');

class PassportBiz extends BaseBiz {

	// 静默登录(有登录状态则不登录)  
	static async loginSilence(that) {
		return await PassportBiz.loginCheck(false, 'slience', 'bar', that);
	}

	// 强制静默登录(有不论是否有登录状态)  
	static async loginSilenceMust(that) {
		return await PassportBiz.loginCheck(false, 'must', 'bar', that);
	}

	// 必须登陆 可以取消(窗口形式) 
	static async loginMustCancelWin(that) {
		return await PassportBiz.loginCheck(true, 'cancel', '', that);
	}

	// 必须登陆 只能强制注册或者回上页(窗口形式)  
	static async loginMustBackWin(that) {
		return await PassportBiz.loginCheck(true, 'back', '', that);
	}

	// 获取token  
	static getToken() {
		let token = cacheHelper.get(constants.CACHE_TOKEN);
		return token || null;
	}

	// 设置token
	static setToken(token) {
		if (!token) return;
		cacheHelper.set(constants.CACHE_TOKEN, token, constants.CACHE_TOKEN_EXPIRE);
	}

	//  获取user id (手机号)
	static getUserId() {
		let token = cacheHelper.get(constants.CACHE_TOKEN);
		if (!token) return '';
		return token.mobile || token.id || '';
	}

	// 获取user name 
	static getUserName() {
		let token = cacheHelper.get(constants.CACHE_TOKEN);
		if (!token) return '';
		return token.name || '';
	}

	static getStatus() {
		let token = cacheHelper.get(constants.CACHE_TOKEN);
		if (!token) return -1;
		return token.status || -1;
	}

	// 是否登录 
	static isLogin() {
		let id = PassportBiz.getUserId();
		return (id.length > 0) ? true : false;
	}

	static loginStatusHandler(method, status) {
		let content = '';
		if (status == 0) content = '您的注册正在审核中，暂时无法使用此功能！';
		else if (status == 8) content = '您的注册审核未通过，暂时无法使用此功能；请在个人中心修改资料，再次提交审核！';
		else if (status == 9) content = '您的账号已经禁用, 无法使用此功能！';
		if (method == 'cancel') {
			wx.showModal({
				title: '温馨提示',
				content,
				confirmText: '取消',
				showCancel: false
			});
		}
		else if (method == 'back') {
			wx.showModal({
				title: '温馨提示',
				content,
				confirmText: '返回',
				showCancel: false,
				success(result) {
					wx.navigateBack();
				}
			});
		}
		return false;
	}

	// 登录判断及处理
	static async loginCheck(mustLogin = false, method = 'back', title = '', that = null) {
		// 如果有退出登录标记，强制要求登录
		if (cacheHelper.get(constants.CACHE_LOGOUT_FLAG)) {
			if (that) that.setData({ isLogin: false });
			if (mustLogin) {
				wx.showModal({
					title: '温馨提示',
					content: '请先登录后再操作',
					confirmText: '马上登录',
					cancelText: '返回',
					success(result) {
						if (result.confirm) {
							wx.reLaunch({
								url: pageHelper.fmtURLByPID('/pages/my/login/my_login'),
							});
						} else {
							wx.navigateBack();
						}
					}
				});
				return false;
			}
			return false;
		}

		let token = cacheHelper.get(constants.CACHE_TOKEN);
		if (token && method != 'must') {
			if (that)
				that.setData({
					isLogin: true
				});
			return true;
		} else {
			if (that) that.setData({
				isLogin: false
			});
		}

		let opt = {
			title: title || '登录中',
		};

		let res = await cloudHelper.callCloudSumbit('passport/login', {}, opt).then(result => {
			PassportBiz.clearToken();
			if (result && helper.isDefined(result.data.token) && result.data.token && result.data.token.status == 1) {
				PassportBiz.setToken(result.data.token);

				if (that) that.setData({
					isLogin: true
				});

				return true;
			}
			else if (mustLogin && result && helper.isDefined(result.data.token) && result.data.token && (result.data.token.status == 0 || result.data.token.status == 8 || result.data.token.status == 9)) {
				let status = result.data.token.status;
				return PassportBiz.loginStatusHandler(method, status);
			}
			else if (mustLogin && method == 'cancel') {
				wx.showModal({
					title: '温馨提示',
					content: '此功能仅限注册用户',
					confirmText: '马上注册',
					cancelText: '取消',
					success(result) {
						if (result.confirm) {
							let url = pageHelper.fmtURLByPID('/pages/my/reg/my_reg') + '?retUrl=back';
							wx.navigateTo({ url });

						} else if (result.cancel) {

						}
					}
				});

				return false;
			}
			else if (mustLogin && method == 'back') {
				wx.showModal({
					title: '温馨提示',
					content: '此功能仅限注册用户',
					confirmText: '马上注册',
					cancelText: '返回',
					success(result) {
						if (result.confirm) {
							let retUrl = encodeURIComponent(pageHelper.getCurrentPageUrlWithArgs());
							let url = pageHelper.fmtURLByPID('/pages/my/reg/my_reg') + '?retUrl=' + retUrl;
							wx.redirectTo({ url });
						} else if (result.cancel) {
							let len = getCurrentPages().length;
							if (len == 1) {
								let url = pageHelper.fmtURLByPID('/pages/default/index/default_index');
								wx.reLaunch({ url });
							}
							else
								wx.navigateBack();

						}
					}
				});

				return false;
			}
			else if (mustLogin && method == 'back') {
				wx.showModal({
					title: '温馨提示',
					content: '此功能仅限注册用户',
					confirmText: '马上注册',
					cancelText: '返回',
					success(result) {
						if (result.confirm) {
							let url = pageHelper.fmtURLByPID('/pages/my/reg/my_reg');
							wx.reLaunch({ url });
						} else if (result.cancel) {
							wx.navigateBack();
						}
					}
				});

				return false;
			}

		}).catch(err => {
			console.log(err);
			PassportBiz.clearToken();
			return false;
		});

		return res;
	}

	// 清除登录缓存
	static clearToken() {
		cacheHelper.remove(constants.CACHE_TOKEN);
	}

	// 退出登录
	static logout() {
		PassportBiz.clearToken();
		cacheHelper.remove(constants.CACHE_LOGOUT_FLAG);
		PublicBiz.removeCacheList('my-task-list');
		PublicBiz.removeCacheList('task-list');
	}

	// 手机号+密码登录
	static async loginByPassword(mobile, password) {
		if (!mobile || mobile.length !== 11) {
			wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
			return false;
		}
		if (!password || password.length < 6) {
			wx.showToast({ title: '请输入密码(至少6位)', icon: 'none' });
			return false;
		}

		try {
			let params = { mobile, password };
			let result = await cloudHelper.callCloudSumbit('passport/login_by_password', params, {
				title: '登录中'
			});

			if (result && result.data.token) {
				PassportBiz.setToken(result.data.token);
				return true;
			}
			return false;
		} catch (err) {
			console.error(err);
			return false;
		}
	}

	// 手机号+验证码登录
	static async loginBySms(mobile, code) {
		if (!mobile || mobile.length !== 11) {
			wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
			return false;
		}
		if (!code || code.length !== 6) {
			wx.showToast({ title: '请输入6位验证码', icon: 'none' });
			return false;
		}

		try {
			let params = { mobile, code };
			let result = await cloudHelper.callCloudSumbit('passport/login_by_sms', params, {
				title: '登录中'
			});

			if (result && result.data.token) {
				PassportBiz.setToken(result.data.token);
				return true;
			}
			return false;
		} catch (err) {
			console.error(err);
			return false;
		}
	}

	// 发送验证码
	static async sendSmsCode(mobile, type = 'login') {
		if (!mobile || mobile.length !== 11) {
			wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
			return false;
		}

		try {
			let params = { mobile, type };
			await cloudHelper.callCloudSumbit('passport/send_sms_code', params, {
				title: '发送中'
			});
			return true;
		} catch (err) {
			console.error(err);
			return false;
		}
	}

	// 手机号码
	static async getPhone(e, that) {
		if (e.detail.errMsg == "getPhoneNumber:ok") {

			let cloudID = e.detail.cloudID;
			let params = {
				cloudID
			};
			let opt = {
				title: '手机验证中'
			};
			await cloudHelper.callCloudSumbit('passport/phone', params, opt).then(res => {
				let phone = res.data;
				if (!phone || phone.length < 11)
					wx.showToast({
						title: '手机号码获取失败，请重新填写手机号码',
						icon: 'none',
						duration: 2000
					});
				else {
					that.setData({
						formMobile: phone
					});
				}
			});
		} else
			wx.showToast({
				title: '手机号码获取失败，请重新填写手机号码',
				icon: 'none'
			});
	}
}



/** 表单校验    */
PassportBiz.CHECK_FORM = {
	name: 'formName|must|string|min:1|max:30|name=昵称',
	mobile: 'formMobile|must|len:11|name=手机',
	password: 'formPassword|string|min:6|max:30|name=密码',
	forms: 'formForms|array'
};


module.exports = PassportBiz;