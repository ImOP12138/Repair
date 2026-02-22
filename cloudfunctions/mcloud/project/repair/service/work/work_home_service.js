/**
 * Notes: 服务者首页管理模块 
 * Date: 2023-01-15 07:48:00 
 * Ver : CCMiniCloud Framework 2.0.8 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 */

const BaseProjectWorkService = require('./base_project_work_service.js');

const timeUtil = require('../../../../framework/utils/time_util.js');
const dataUtil = require('../../../../framework/utils/data_util.js');
const md5Lib = require('../../../../framework/lib/md5_lib.js');

const MemberModel = require('../../model/member_model.js');
const TaskModel = require('../../model/task_model.js'); 

class WorkHomeService extends BaseProjectWorkService {


	/**
	 * 首页数据归集
	 */
	async workHome(memberId) {
		let member = await MemberModel.getOne(memberId);
		if (!member) this.AppError('工作人员不存在');

		let where = {
			TASK_MEMBER_ID: memberId
		}

		where.TASK_STATUS = TaskModel.STATUS.APPT;
		let apptTaskCnt = await TaskModel.count(where);

		where.TASK_STATUS = TaskModel.STATUS.RUN;
		let runTaskCnt = await TaskModel.count(where);

		where.TASK_STATUS = TaskModel.STATUS.OVER;
		let overTaskCnt = await TaskModel.count(where); 
	 

		return {
			taskStat: { apptTaskCnt, runTaskCnt, overTaskCnt },
			pic: member.MEMBER_OBJ.img[0],
		};

	}


	// 登录  
	async workLogin(phone, password, openId) {


		// 判断是否存在
		let where = {
			MEMBER_PHONE: phone,
			MEMBER_PASSWORD: md5Lib.md5(password),
			MEMBER_STATUS: MemberModel.STATUS.COMM
		}
		let fields = '*';
		let member = await MemberModel.getOne(where, fields);
		if (!member)
			this.AppError('该账号不存在或者密码错误');

		let cnt = member.MEMBER_LOGIN_CNT;

		// 生成token
		let token = dataUtil.genRandomString(32);
		let tokenTime = timeUtil.time();
		let data = {
			MEMBER_MINI_OPENID: openId,
			MEMBER_TOKEN: token,
			MEMBER_TOKEN_TIME: tokenTime,
			MEMBER_LOGIN_TIME: timeUtil.time(),
			MEMBER_LOGIN_CNT: cnt + 1
		}
		await MemberModel.edit(where, data);

		let name = member.MEMBER_TITLE;
		let id = member._id;
		let last = (!member.MEMBER_LOGIN_TIME) ? '尚未登录' : timeUtil.timestamp2Time(member.MEMBER_LOGIN_TIME);
		let cateId = member.MEMBER_CATE_ID;
		let cateName = member.MEMBER_CATE_NAME;

		return {
			id,
			token,
			name,
			last,
			cateId,
			cateName,
			cnt
		}

	}

	/** 修改自身密码 */
	async pwdWork(workId, oldPassword, password) {
		let where = {
			_id: workId,
			MEMBER_PASSWORD: md5Lib.md5(oldPassword)
		};
		let member = await MemberModel.getOne(where);
		if (!member) this.AppError('旧密码错误');

		let data = {
			MEMBER_PASSWORD: md5Lib.md5(password)
		};
		await MemberModel.edit(workId, data);
	}

	/** 绑定微信号 */
	async bindWorkWx(workId, openId) {
		if (!openId) {
			this.AppError('获取微信号失败');
		}

		let existMember = await MemberModel.getOne({
			MEMBER_MINI_OPENID: openId,
			_id: { $ne: workId }
		});
		if (existMember) {
			this.AppError('该微信号已被其他工作人员绑定');
		}

		let where = { _id: workId };
		let data = { 
			MEMBER_MINI_OPENID: openId,
			MEMBER_WX_BIND_TIME: timeUtil.time()
		};
		await MemberModel.edit(where, data);

		return { success: true };
	}

	/** 解绑微信号 */
	async unbindWorkWx(workId) {
		let member = await MemberModel.getOne({ _id: workId });
		if (!member) {
			this.AppError('工作人员不存在');
		}

		if (member.MEMBER_WX_UNBIND_TIME) {
			let unbindTime = member.MEMBER_WX_UNBIND_TIME;
			let now = timeUtil.time();
			let cooldownDays = 7;
			let cooldownSeconds = cooldownDays * 24 * 60 * 60;
			
			if (now - unbindTime < cooldownSeconds) {
				let remainingDays = Math.ceil((cooldownSeconds - (now - unbindTime)) / (24 * 60 * 60));
				this.AppError(`解绑冷却中，还需等待 ${remainingDays} 天`);
			}
		}

		let where = { _id: workId };
		let data = { 
			MEMBER_MINI_OPENID: '',
			MEMBER_WX_UNBIND_TIME: timeUtil.time()
		};
		await MemberModel.edit(where, data);

		return { success: true };
	}

	/** 微信验证登录 */
	async loginByWx(openId) {
		if (!openId) {
			this.AppError('获取微信号失败');
		}

		let where = {
			MEMBER_MINI_OPENID: openId,
			MEMBER_STATUS: MemberModel.STATUS.COMM
		};
		let fields = 'MEMBER_ID,MEMBER_TITLE,MEMBER_CATE_ID,MEMBER_CATE_NAME,MEMBER_LOGIN_TIME,MEMBER_LOGIN_CNT';
		let member = await MemberModel.getOne(where, fields);

		if (!member) {
			return {
				success: false,
				msg: '该微信号未绑定工作人员账号，请先在工作平台绑定'
			};
		}

		let cnt = member.MEMBER_LOGIN_CNT || 0;
		let token = dataUtil.genRandomString(32);
		let tokenTime = timeUtil.time();

		let updateData = {
			MEMBER_TOKEN: token,
			MEMBER_TOKEN_TIME: tokenTime,
			MEMBER_LOGIN_TIME: timeUtil.time(),
			MEMBER_LOGIN_CNT: cnt + 1
		};
		await MemberModel.edit(where, updateData);

		return {
			success: true,
			id: member._id,
			token,
			name: member.MEMBER_TITLE,
			cateId: member.MEMBER_CATE_ID,
			cateName: member.MEMBER_CATE_NAME,
			last: (!member.MEMBER_LOGIN_TIME) ? '尚未登录' : timeUtil.timestamp2Time(member.MEMBER_LOGIN_TIME)
		};
	}

}

module.exports = WorkHomeService;