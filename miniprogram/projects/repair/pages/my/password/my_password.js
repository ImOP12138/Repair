const pageHelper = require('../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../helper/cloud_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');

Page({
	data: {
		isLoad: true,
		oldPassword: '',
		newPassword: '',
		confirmPassword: '',
		hasPassword: false
	},

	onLoad: async function (options) {
		ProjectBiz.initPage(this);
	},

	onShow: function () { },

	bindOldPasswordInput: function (e) {
		this.setData({ oldPassword: e.detail.value });
	},

	bindNewPasswordInput: function (e) {
		this.setData({ newPassword: e.detail.value });
	},

	bindConfirmPasswordInput: function (e) {
		this.setData({ confirmPassword: e.detail.value });
	},

	bindSubmitTap: async function (e) {
		let { oldPassword, newPassword, confirmPassword } = this.data;

		if (!newPassword || newPassword.length < 6) {
			wx.showToast({ title: '新密码长度不能少于6位', icon: 'none' });
			return;
		}

		if (newPassword !== confirmPassword) {
			wx.showToast({ title: '两次输入的密码不一致', icon: 'none' });
			return;
		}

		try {
			wx.showLoading({ title: '提交中...', mask: true });

			let params = { password: newPassword };
			await cloudHelper.callCloudSumbit('passport/set_password', params);

			wx.hideLoading();
			wx.showToast({ title: '密码设置成功', icon: 'success' });
			
			setTimeout(() => {
				wx.navigateBack();
			}, 1500);
		} catch (err) {
			wx.hideLoading();
			console.error(err);
			if (err && err.msg) {
				wx.showToast({ title: err.msg, icon: 'none' });
			} else {
				wx.showToast({ title: '设置失败，请重试', icon: 'none' });
			}
		}
	}
})
