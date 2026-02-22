/**
 * Notes: 用户管理
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-01-22  07:48:00 
 */

const BaseProjectAdminService = require('./base_project_admin_service.js');

const util = require('../../../../framework/utils/util.js');
const exportUtil = require('../../../../framework/utils/export_util.js');
const timeUtil = require('../../../../framework/utils/time_util.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const UserModel = require('../../model/user_model.js');
const MemberModel = require('../../model/member_model.js');
const AdminHomeService = require('./admin_home_service.js');

// 导出用户数据KEY
const EXPORT_USER_DATA_KEY = 'EXPORT_USER_DATA';

class AdminUserService extends BaseProjectAdminService {

	 

	/** 获得某个用户信息 */
	async getUser({
		userId,
		fields = '*'
	}) {
		let where = {
			USER_MINI_OPENID: userId,
		}
		return await UserModel.getOne(where, fields);
	}

	/** 取得用户分页列表 */
	async getUserList({
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
			USER_ADD_TIME: 'desc'
		};
		let fields = '*';


		let where = {};
		where.and = {
			_pid: this.getProjectId() //复杂的查询在此处标注PID
		};

		if (util.isDefined(search) && search) {
			where.or = [{
				USER_NAME: ['like', search]
			},
			{
				USER_MOBILE: ['like', search]
			},
			{
				USER_MEMO: ['like', search]
			},
			];

		} else if (sortType && util.isDefined(sortVal)) {
			// 搜索菜单
			switch (sortType) {
				case 'status':
					where.and.USER_STATUS = Number(sortVal);
					break;
				case 'sort': {
					orderBy = this.fmtOrderBySort(sortVal, 'USER_ADD_TIME');
					break;
				}
			}
		}
		let result = await UserModel.getList(where, fields, orderBy, page, size, true, oldTotal, false);


		// 为导出增加一个参数condition
		result.condition = encodeURIComponent(JSON.stringify(where)); 

		return result;
	}

	async statusUser(id, status, reason) {
		let where = {
			_id: id
		};
		let data = {
			USER_STATUS: status,
			USER_CHECK_REASON: reason || ''
		};
		await UserModel.edit(where, data);
	}

	/**删除用户 */
	async delUser(id) {
		let where = {
			_id: id
		};
		await UserModel.del(where);
	}

	// #####################导出用户数据

	/**获取用户数据 */
	async getUserDataURL() {
		return await exportUtil.getExportDataURL(EXPORT_USER_DATA_KEY);
	}

	/**删除用户数据 */
	async deleteUserDataExcel() {
		return await exportUtil.deleteDataExcel(EXPORT_USER_DATA_KEY);
	}

	/**导出用户数据 */
	async exportUserDataExcel(condition, fields) {
		try {
			condition = JSON.parse(decodeURIComponent(condition));
		} catch (e) {
			condition = {};
		}

		let where = condition;
		let orderBy = {
			USER_ADD_TIME: 'desc'
		};

		let list = await UserModel.getAll(where, '*', orderBy, 1000);

		let title = '用户数据导出';

		let data = [];
		let header = [];
		for (let k in fields) {
			header.push(fields[k].title);
		}
		data.push(header);

		for (let k in list) {
			let node = list[k];
			let row = [];
			for (let j in fields) {
				let field = fields[j].field;
				let val = node[field];
				if (field === 'USER_STATUS') {
					val = UserModel.STATUS_DESC[val] || val;
				} else if (field === 'USER_ADD_TIME' || field === 'USER_LOGIN_TIME') {
					val = timeUtil.timestamp2Time(val);
				}
				row.push(val || '');
			}
			data.push(row);
		}

		return await exportUtil.exportDataExcel(EXPORT_USER_DATA_KEY, title, list.length, data);
	}

}

module.exports = AdminUserService;