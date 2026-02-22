const pageHelper = require('../../../../../helper/page_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const projectSetting = require('../../../public/project_setting.js');

Page({
    data: {
        service: null,
        type: 0
    },

    onLoad: async function (options) {
        ProjectBiz.initPage(this);
        
        let type = options.type || 0;
        let services = projectSetting.SERVICE_PRODUCTS || [];
        let service = services.find(s => s.id == type) || services[0];
        
        this.setData({
            service,
            type
        });
    },

    onReady: function () { },

    onShow: async function () { },

    onPullDownRefresh: async function () {
        wx.stopPullDownRefresh();
    },

    onHide: function () { },

    onUnload: function () { },

    url: async function (e) {
        pageHelper.url(e, this);
    },

    bindOrderTap: function (e) {
        let type = this.data.type;
        wx.reLaunch({
            url: '../../task/add/task_add?type=' + type
        });
    },

    onShareAppMessage: function () {
        let service = this.data.service;
        return {
            title: service ? service.title : '维修服务',
            path: 'projects/repair/pages/service/detail/service_detail?type=' + this.data.type
        };
    },
})
