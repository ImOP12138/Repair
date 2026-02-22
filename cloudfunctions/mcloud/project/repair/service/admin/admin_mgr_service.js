/**
 * Notes: 管理员管理
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2021-07-11 07:48:00 
 */

const BaseProjectAdminService = require('./base_project_admin_service.js');
const util = require('../../../../framework/utils/util.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const timeUtil = require('../../../../framework/utils/time_util.js');
const AdminModel = require('../../../../framework/platform/model/admin_model.js');
const LogModel = require('../../../../framework/platform/model/log_model.js');
const md5Lib = require('../../../../framework/lib/md5_lib.js');
const setupUtil = require('../../../../framework/utils/setup/setup_util.js');

class AdminMgrService extends BaseProjectAdminService {

    //**管理员登录  */
    async adminLogin(name, password, openId) {

        // 判断是否存在
        let where = {
            ADMIN_STATUS: 1,
            ADMIN_NAME: name,
            ADMIN_PASSWORD: md5Lib.md5(password)
        }
        let fields = 'ADMIN_ID,ADMIN_NAME,ADMIN_DESC,ADMIN_TYPE,ADMIN_LOGIN_TIME,ADMIN_LOGIN_CNT';
        let admin = await AdminModel.getOne(where, fields);
        if (!admin)
            this.AppError('管理员不存在或者已停用');

        let cnt = admin.ADMIN_LOGIN_CNT;

        // 生成token
        let token = dataUtil.genRandomString(32);
        let tokenTime = timeUtil.time();
        let data = { 
            ADMIN_TOKEN: token,
            ADMIN_TOKEN_TIME: tokenTime,
            ADMIN_LOGIN_TIME: timeUtil.time(),
            ADMIN_LOGIN_CNT: cnt + 1
        }
        await AdminModel.edit(where, data);

        let type = admin.ADMIN_TYPE;
        let last = (!admin.ADMIN_LOGIN_TIME) ? '尚未登录' : timeUtil.timestamp2Time(admin.ADMIN_LOGIN_TIME);

        // 写日志
        this.insertLog('登录了系统', admin, LogModel.TYPE.SYS);

        return {
            token,
            name: admin.ADMIN_NAME,
            type,
            last,
            cnt
        }

    }

    async clearLog() {
        await LogModel.clear();
    }

    /** 取得日志分页列表 */
    async getLogList({
        search, // 搜索条件
        sortType, // 搜索菜单
        sortVal, // 搜索菜单
        orderBy, // 排序
        whereEx, //附加查询条件 
        page,
        size,
        oldTotal = 0
    }) {

        orderBy = orderBy || {
            LOG_ADD_TIME: 'desc'
        };
        let fields = '*';
        let where = {};

        if (util.isDefined(search) && search) {
            where.or = [{
                LOG_CONTENT: ['like', search]
            }, {
                LOG_ADMIN_DESC: ['like', search]
            }, {
                LOG_ADMIN_NAME: ['like', search]
            }];

        } else if (sortType && util.isDefined(sortVal)) {
            // 搜索菜单
            switch (sortType) {
                case 'type':
                    // 按类型
                    where.LOG_TYPE = Number(sortVal);
                    break;
            }
        }
        let result = await LogModel.getList(where, fields, orderBy, page, size, true, oldTotal);


        return result;
    }

    /** 获取所有管理员 */
    async getMgrList({
        search, // 搜索条件
        sortType, // 搜索菜单
        sortVal, // 搜索菜单
        orderBy, // 排序
        whereEx, //附加查询条件
        page,
        size,
        isTotal = true,
        oldTotal
    }) {
        orderBy = {
            ADMIN_ADD_TIME: 'desc'
        }
        let fields = 'ADMIN_NAME,ADMIN_STATUS,ADMIN_PHONE,ADMIN_TYPE,ADMIN_LOGIN_CNT,ADMIN_LOGIN_TIME,ADMIN_DESC,ADMIN_EDIT_TIME,ADMIN_EDIT_IP';

        let where = {};
        where.and = {
            _pid: this.getProjectId() //复杂的查询在此处标注PID
        };
        if (util.isDefined(search) && search) {
            where.or = [{
                ADMIN_NAME: ['like', search]
            },
            {
                ADMIN_PHONE: ['like', search]
            },
            {
                ADMIN_DESC: ['like', search]
            }
            ];
        } else if (sortType && util.isDefined(sortVal)) {
            // 搜索菜单
            switch (sortType) {
                case 'status':
                    // 按类型
                    where.and.ADMIN_STATUS = Number(sortVal);
                    break;
                case 'type':
                    // 按类型
                    where.and.ADMIN_TYPE = Number(sortVal);
                    break;
            }
        }

        return await AdminModel.getList(where, fields, orderBy, page, size, isTotal, oldTotal);
    }

    /** 删除管理员 */
    async delMgr(id, myAdminId) {
        if (id === myAdminId) this.AppError('不能删除自己');
        let where = {
            _id: id
        };
        await AdminModel.del(where);
    }

    /** 添加新的管理员 */
    async insertMgr({
        name,
        desc,
        phone,
        password
    }) {
        let existAdmin = await AdminModel.getOne({ ADMIN_NAME: name });
        if (existAdmin) this.AppError('该管理员已存在');

        let data = {};
        data.ADMIN_NAME = name;
        data.ADMIN_DESC = desc;
        data.ADMIN_PHONE = phone;
        data.ADMIN_PASSWORD = md5Lib.md5(password);
        data.ADMIN_TYPE = 1;

        let id = await AdminModel.insert(data);
        return { id };
    }

    /** 修改状态 */
    async statusMgr(id, status, myAdminId) {
        if (id === myAdminId) this.AppError('不能修改自己的状态');
        let where = {
            _id: id
        };
        let data = {
            ADMIN_STATUS: status
        };
        await AdminModel.edit(where, data);
    }


    /** 获取管理员信息 */
    async getMgrDetail(id) {
        let fields = '*';

        let where = {
            _id: id
        }
        let mgr = await AdminModel.getOne(where, fields);
        if (!mgr) return null;

        return mgr;
    }

    /** 修改管理员 */
    async editMgr(id, {
        name,
        desc,
        phone,
        password
    }) {
        let existAdmin = await AdminModel.getOne({
            ADMIN_NAME: name,
            _id: { $ne: id }
        });
        if (existAdmin) this.AppError('该管理员名称已存在');

        let where = {
            _id: id
        };
        let data = {};
        data.ADMIN_NAME = name;
        data.ADMIN_DESC = desc;
        data.ADMIN_PHONE = phone;
        if (password) {
            data.ADMIN_PASSWORD = md5Lib.md5(password);
        }
        await AdminModel.edit(where, data);
    }

    /** 修改自身密码 */
    async pwdtMgr(adminId, oldPassword, password) {
        let where = {
            _id: adminId,
            ADMIN_PASSWORD: md5Lib.md5(oldPassword)
        };
        let admin = await AdminModel.getOne(where);
        if (!admin) this.AppError('旧密码错误');

        let data = {
            ADMIN_PASSWORD: md5Lib.md5(password)
        };
        await AdminModel.edit(adminId, data);
    }

    async createQrLoginCode() {
        let code = dataUtil.genRandomString(8).toUpperCase();
        let expireTime = timeUtil.time() + 300;
        await setupUtil.set('QR_LOGIN_' + code, {
            status: 'waiting',
            expireTime,
            admin: null,
            token: null
        }, 'qr_login');
        return { code, expireTime };
    }

    async checkQrLoginCode(code) {
        let data = await setupUtil.get('QR_LOGIN_' + code);
        if (!data) {
            return { status: 'invalid', msg: '登录码无效或已过期' };
        }
        if (timeUtil.time() > data.expireTime) {
            await setupUtil.remove('QR_LOGIN_' + code);
            return { status: 'expired', msg: '登录码已过期' };
        }
        if (data.status === 'confirmed' && data.token) {
            await setupUtil.remove('QR_LOGIN_' + code);
            return {
                status: 'confirmed',
                token: data.token,
                name: data.admin.ADMIN_NAME,
                type: data.admin.ADMIN_TYPE
            };
        }
        return { status: 'waiting', msg: '等待管理员扫码确认' };
    }

    async confirmQrLoginCode(code, admin) {
        let data = await setupUtil.get('QR_LOGIN_' + code);
        if (!data) {
            this.AppError('登录码无效或已过期');
        }
        if (timeUtil.time() > data.expireTime) {
            await setupUtil.remove('QR_LOGIN_' + code);
            this.AppError('登录码已过期');
        }

        let token = dataUtil.genRandomString(32);
        let tokenTime = timeUtil.time();

        let where = { _id: admin._id };
        let updateData = {
            ADMIN_TOKEN: token,
            ADMIN_TOKEN_TIME: tokenTime,
            ADMIN_LOGIN_TIME: timeUtil.time(),
            ADMIN_LOGIN_CNT: (admin.ADMIN_LOGIN_CNT || 0) + 1
        };
        await AdminModel.edit(where, updateData);

        await setupUtil.set('QR_LOGIN_' + code, {
            status: 'confirmed',
            expireTime: data.expireTime,
            admin: {
                ADMIN_NAME: admin.ADMIN_NAME,
                ADMIN_TYPE: admin.ADMIN_TYPE
            },
            token
        }, 'qr_login');

        this.insertLog('扫码登录确认', admin, LogModel.TYPE.SYS);

        return { success: true };
    }

    async bindAdminWx(adminId, openId) {
        let existAdmin = await AdminModel.getOne({
            ADMIN_MINI_OPENID: openId,
            _id: { $ne: adminId }
        });
        if (existAdmin) {
            this.AppError('该微信号已被其他管理员绑定');
        }

        let where = { _id: adminId };
        let data = { 
            ADMIN_MINI_OPENID: openId,
            ADMIN_WX_BIND_TIME: timeUtil.time()
        };
        await AdminModel.edit(where, data);

        return { success: true };
    }

    async unbindAdminWx(adminId) {
        let where = { _id: adminId };
        let data = { 
            ADMIN_MINI_OPENID: '',
            ADMIN_WX_UNBIND_TIME: timeUtil.time()
        };
        await AdminModel.edit(where, data);

        return { success: true };
    }

    async loginByWx(openId) {
        if (!openId) {
            this.AppError('获取微信号失败');
        }

        let where = {
            ADMIN_MINI_OPENID: openId,
            ADMIN_STATUS: 1
        };
        let fields = 'ADMIN_ID,ADMIN_NAME,ADMIN_DESC,ADMIN_TYPE,ADMIN_LOGIN_TIME,ADMIN_LOGIN_CNT';
        let admin = await AdminModel.getOne(where, fields);

        if (!admin) {
            return { 
                success: false, 
                msg: '该微信号未绑定管理员账号，请先在后台绑定' 
            };
        }

        let cnt = admin.ADMIN_LOGIN_CNT || 0;
        let token = dataUtil.genRandomString(32);
        let tokenTime = timeUtil.time();

        let updateData = {
            ADMIN_TOKEN: token,
            ADMIN_TOKEN_TIME: tokenTime,
            ADMIN_LOGIN_TIME: timeUtil.time(),
            ADMIN_LOGIN_CNT: cnt + 1
        };
        await AdminModel.edit(where, updateData);

        this.insertLog('微信验证登录', admin, LogModel.TYPE.SYS);

        return {
            success: true,
            token,
            name: admin.ADMIN_NAME,
            type: admin.ADMIN_TYPE,
            last: (!admin.ADMIN_LOGIN_TIME) ? '尚未登录' : timeUtil.timestamp2Time(admin.ADMIN_LOGIN_TIME)
        };
    }
}

module.exports = AdminMgrService;