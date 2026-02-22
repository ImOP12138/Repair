const pageHelper = require('../../../../../helper/page_helper.js');  
const ProjectBiz = require('../../../biz/project_biz.js'); 
const projectSetting = require('../../../public/project_setting.js');

Page({
    data: { 
        services: []
    },

    onLoad: async function (options) {
        ProjectBiz.initPage(this);
        this.setData({
            services: projectSetting.SERVICE_PRODUCTS || []
        });
    },

    onReady: function () { },

    onShow: async function () {  
    },

    onPullDownRefresh: async function () { 
        wx.stopPullDownRefresh();
    },

    onHide: function () {

    },

    onUnload: function () {

    }, 

    url: async function (e) {
        pageHelper.url(e, this);
    },

    bindServiceTap: function (e) {
        let type = e.currentTarget.dataset.type;
        wx.navigateTo({
            url: '../../service/detail/service_detail?type=' + type
        });
    },

    onShareAppMessage: function () {

    },
})
