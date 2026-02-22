const AdminBiz = require('../../../../../../comm/biz/admin_biz.js');
const pageHelper = require('../../../../../../helper/page_helper.js');
const cloudHelper = require('../../../../../../helper/cloud_helper.js');
const timeUtil = require('../../../../../../helper/time_helper.js');

Page({
    data: {
        code: '',
        expireTime: 0,
        countdown: 0,
        timer: null
    },

    onLoad: function (options) {
        if (!AdminBiz.isAdmin(this)) return;
    },

    onUnload: function () {
        if (this.data.timer) {
            clearInterval(this.data.timer);
        }
    },

    bindCreateCodeTap: async function () {
        try {
            wx.showLoading({ title: '生成中...' });
            let res = await cloudHelper.callCloudData('admin/qr_login_create', {});
            wx.hideLoading();

            if (res && res.code) {
                this.setData({
                    code: res.code,
                    expireTime: res.expireTime,
                    countdown: 300
                });

                this.startCountdown();
            }
        } catch (err) {
            console.log(err);
        }
    },

    startCountdown: function () {
        if (this.data.timer) {
            clearInterval(this.data.timer);
        }

        let timer = setInterval(() => {
            let countdown = this.data.countdown - 1;
            if (countdown <= 0) {
                clearInterval(timer);
                this.setData({
                    code: '',
                    countdown: 0
                });
            } else {
                this.setData({ countdown });
            }
        }, 1000);

        this.setData({ timer });
    },

    bindCopyCodeTap: function () {
        if (!this.data.code) return;
        wx.setClipboardData({
            data: this.data.code,
            success: () => {
                wx.showToast({ title: '已复制', icon: 'success' });
            }
        });
    }
});
