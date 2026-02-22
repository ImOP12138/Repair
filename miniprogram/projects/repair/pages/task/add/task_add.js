const cloudHelper = require('../../../../../helper/cloud_helper.js');
const pageHelper = require('../../../../../helper/page_helper.js');
const ProjectBiz = require('../../../biz/project_biz.js');
const TaskBiz = require('../../../biz/task_biz.js');
const PublicBiz = require('../../../../../comm/biz/public_biz.js');
const PassportBiz = require('../../../../../comm/biz/passport_biz.js');
const projectSetting = require('../../../public/project_setting.js');

Page({
    data: {
        serviceType: null,
        serviceTitle: '',
        fields: [],
        forms: [],
        commonAddress: '',
        showCommonAddress: false
    },

    onLoad: async function (options) {
        ProjectBiz.initPage(this);

        let serviceType = options.type !== undefined ? parseInt(options.type) : null;
        let serviceTitle = '';
        let defaultForms = [];
        let fields = JSON.parse(JSON.stringify(projectSetting.TASK_FIELDS));

        if (serviceType !== null) {
            let services = projectSetting.SERVICE_PRODUCTS || [];
            let service = services.find(s => s.id === serviceType);
            if (service) {
                serviceTitle = service.title;
                
                defaultForms = [
                    { mark: 'type', title: '报修类型', type: 'text', val: serviceTitle }
                ];
                
                for (let i = 0; i < fields.length; i++) {
                    if (fields[i].mark === 'type') {
                        fields[i].type = 'text';
                        fields[i].readOnly = true;
                        fields[i].val = serviceTitle;
                        delete fields[i].selectOptions;
                        break;
                    }
                }
            }
        }

        await this._loadCommonAddress();

        this.setData({
            serviceType,
            serviceTitle,
            fields: fields,
            forms: defaultForms
        });
    },

    onReady: function () { },

    onShow: function () {

    },

    onHide: function () {

    },

    onUnload: function () {

    },

    onPullDownRefresh: async function () {
    },

    url: function (e) {
        pageHelper.url(e, this);
    },

    _loadCommonAddress: async function () {
        try {
            let opts = {
                title: 'bar'
            }
            let user = await cloudHelper.callCloudData('passport/my_detail', {}, opts);
            if (user && user.USER_OBJ && user.USER_OBJ.commonAddress) {
                this.setData({
                    commonAddress: user.USER_OBJ.commonAddress,
                    showCommonAddress: true
                });
            }
        } catch (err) {
            console.log('加载常用地址失败:', err);
        }
    },

    bindUseCommonAddress: function () {
        if (!this.data.commonAddress) return;
        
        let formCmpt = this.selectComponent("#task-form-show");
        if (formCmpt) {
            formCmpt.setOneFormVal('address', this.data.commonAddress);
            wx.showToast({ title: '已填入常用地址', icon: 'success' });
        } else {
            wx.showToast({ title: '表单组件未加载', icon: 'none' });
        }
    },

    bindClearCommonAddress: function () {
        let formCmpt = this.selectComponent("#task-form-show");
        if (formCmpt) {
            formCmpt.setOneFormVal('address', '');
        }
    },

    bindCheckTap: async function (e) {
        if (!await PassportBiz.loginMustCancelWin(this)) return;
        this.selectComponent("#task-form-show").checkForms();
    },

    bindSubmitCmpt: async function (e) {
        if (!await PassportBiz.loginMustCancelWin(this)) return;

        let forms = e.detail;

        let callback = async () => {
            try {
                let opts = {
                    title: '提交中'
                }
                let params = {
                    forms,
                }
                let result = await cloudHelper.callCloudSumbit('task/insert', params, opts);
                let taskId = result.data.id;

                let timeHelper = require('../../../../../helper/time_helper');
                await cloudHelper.transFormsTempPics(forms, 'task-day/' + timeHelper.time('Y-M-D') + '/', taskId, 'task/task_update_forms');

                let cb = () => {
                    PublicBiz.removeCacheList('my-task-list');

                    wx.reLaunch({
                        url: '../my_list/task_my_list'
                    });
                }
                pageHelper.showNoneToast('填报完成，等待处理', 2000, cb);


            } catch (err) {
                console.log(err);
            };
        }


        wx.requestSubscribeMessage({
            tmplIds: [projectSetting.MINI_MSG_TASK_APPT, projectSetting.MINI_MSG_TASK_RUN, projectSetting.MINI_MSG_TASK_OVER],
            async complete() {
                callback();
            }
        });
    }

})
