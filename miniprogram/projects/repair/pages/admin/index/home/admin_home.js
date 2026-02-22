const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../../helper/cloud_helper.js');
const cacheHelper = require('../../../../../../helper/cache_helper.js');

Page({

	/**
	 * 页面的初始数据
	 */
	data: {},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: async function (options) {
		if (!AdminBiz.isAdmin(this)) return;

		this._loadDetail();
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: async function () {
		await this._loadDetail();
		wx.stopPullDownRefresh();
	},

	_loadDetail: async function () {

		let admin = AdminBiz.getAdminToken();
		this.setData({
			isLoad: true,
			admin
		});

		try {
			let opts = {
				title: 'bar'
			}
			let res = await cloudHelper.callCloudData('admin/home', {}, opts);
			this.setData({
				stat: res
			});

		} catch (err) {
			console.log(err);
		}
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
		this._loadDetail();
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

	url: function (e) {
		pageHelper.url(e, this);
	},

	bindMoreTap: function (e) {
		let itemList = ['取消所有首页推荐'];
		wx.showActionSheet({
			itemList,
			success: async res => {
				let idx = res.tapIndex;

				if (idx == 0) {
					this._clearVouch();
				}

			},
			fail: function (res) { }
		})
	},

	_clearVouch: async function (e) {
		let cb = async () => {
			try {
				await cloudHelper.callCloudSumbit('admin/clear_vouch').then(res => {
					pageHelper.showSuccToast('操作成功');
				})
			} catch (err) {
				console.log(err);
			}
		};
		pageHelper.showConfirm('您确认清除所有首页推荐？', cb)
	},

	bindExitTap: function (e) {

		let callback = function () {
			AdminBiz.clearAdminToken();
			wx.reLaunch({
				url: pageHelper.fmtURLByPID('/pages/my/index/my_index'),
			});
		}
		pageHelper.showConfirm('您确认退出?', callback);
	},

	bindWxTap: async function (e) {
		wx.showActionSheet({
			itemList: ['绑定微信', '解绑微信'],
			success: async (res) => {
				if (res.tapIndex === 0) {
					this.doBindAdminWx();
				} else if (res.tapIndex === 1) {
					this.doUnbindAdminWx();
				}
			}
		});
	},

	doBindAdminWx: async function () {
		wx.showModal({
			title: '绑定微信号',
			content: '绑定后，下次打开小程序将自动登录管理后台。确定绑定吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						wx.showLoading({ title: '绑定中...' });
						let result = await cloudHelper.callCloudData('admin/bind_wx', {});
						wx.hideLoading();
						
						if (result && result.success) {
							wx.showToast({ title: '绑定成功', icon: 'success' });
						}
					} catch (err) {
						wx.hideLoading();
						console.log(err);
						wx.showToast({ title: '绑定失败', icon: 'none' });
					}
				}
			}
		});
	},

	doUnbindAdminWx: async function () {
		wx.showModal({
			title: '解绑微信号',
			content: '解绑后，下次打开小程序将不再自动登录管理后台。确定解绑吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						wx.showLoading({ title: '解绑中...' });
						let result = await cloudHelper.callCloudData('admin/unbind_wx', {});
						wx.hideLoading();
						
						if (result && result.success) {
							wx.showToast({ title: '解绑成功', icon: 'success' });
						}
					} catch (err) {
						wx.hideLoading();
						console.log(err);
						wx.showToast({ title: '解绑失败', icon: 'none' });
					}
				}
			}
		});
	},

	bindClearCacheTap: function (e) {
		wx.showModal({
			title: '清除缓存',
			content: '确定要清除所有缓存数据吗？',
			success: (res) => {
				if (res.confirm) {
					cacheHelper.clear();
					pageHelper.showNoneToast('清除缓存成功');
				}
			}
		});
	},

})