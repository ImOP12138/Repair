const pageHelper = require('../../../../../helper/page_helper.js');
const helper = require('../../../../../helper/helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');
const validate = require('../../../../../helper/validate.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const projectSetting = require('../../../public/project_setting.js');
const setting = require('../../../../../setting/setting.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
const cacheHelper = require('../../../../../helper/cache_helper.js');
const constants = require('../../../../../comm/constants.js');

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		isLoad: false,
		isEdit: false,

		mobileCheck: false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		ProjectBiz.initPage(this);

		if (options && options.retUrl)
			this.data.retUrl = decodeURIComponent(options.retUrl);

		await this._loadDetail();
	},

	_loadDetail: async function (e) {
		this.setData({
			isLoad: true,
			fields: projectSetting.USER_FIELDS,
			formName: '',
			formMobile: '',
			formPassword: '',
			formForms: []
		});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

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

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: async function () {
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	bindGetPhoneNumber: async function (e) {
		PassportBiz.getPhone(e, this);
	},


	bindSubmitTap: async function (e) {
		let data = this.data;

		// 数据校验 
		data = validate.check(data, PassportBiz.CHECK_FORM, this);
		if (!data) return;

		// 检查手机号是否已被注册
		wx.showLoading({ title: '检查中...', mask: true });
		try {
			let checkRes = await cloudHelper.callCloudSumbit('passport/check_mobile', { mobile: data.mobile }, { hint: false });
			console.log('checkMobileRegistered result:', checkRes);
			if (checkRes && checkRes.data && checkRes.data.registered) {
				wx.hideLoading();
				wx.showModal({
					title: '提示',
					content: '该手机号已注册，请直接登录或使用验证码登录',
					confirmText: '去登录',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							wx.reLaunch({
								url: pageHelper.fmtURLByPID('/pages/my/login/my_login'),
							});
						}
					}
				});
				return;
			}
		} catch (err) {
			console.log('checkMobileRegistered error:', err);
			// 忽略检查错误，继续注册
		}
		wx.hideLoading();

		try {
			let forms = this.selectComponent("#cmpt-form").getForms(true);
			if (!forms) return;
			data.forms = forms;

			data.status = projectSetting.USER_REG_CHECK ? 0 : 1;

			console.log('register data:', data);

			let opts = {
				title: '提交中'
			}
			let result = await cloudHelper.callCloudSumbit('passport/register', data, opts);
			
			console.log('register result:', result);
			
			if (result && helper.isDefined(result.data.token) && result.data.token) {
				cacheHelper.remove(constants.CACHE_LOGOUT_FLAG);

				// 用户需要审核，不能登录
				if (!projectSetting.USER_REG_CHECK) PassportBiz.setToken(result.data.token);

				let callback = () => {
					if (this.data.retUrl == 'back')
						wx.navigateBack();
					else if (this.data.retUrl)
						wx.reLaunch({
							url: this.data.retUrl,
						})
					else
						wx.reLaunch({ url: '../index/my_index' });
				}

				if (projectSetting.USER_REG_CHECK)
					pageHelper.showModal('注册完成，等待系统审核', '温馨提示', callback);
				else
					pageHelper.showSuccToast('注册成功', 1500, callback);
			}
		} catch (err) {
			console.error('register error:', err);
			if (err && err.msg) {
				wx.showToast({ title: err.msg, icon: 'none' });
			} else {
				wx.showToast({ title: '系统开小差了，稍后再试', icon: 'none' });
			}
		}
	}
})