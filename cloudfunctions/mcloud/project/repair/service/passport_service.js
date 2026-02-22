/**
 * Notes: passport模块业务逻辑 
 * Date: 2020-10-14 07:48:00 
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 */

const BaseProjectService = require('./base_project_service.js');
const cloudBase = require('../../../framework/cloud/cloud_base.js');
const UserModel = require('../model/user_model.js');
const AdminModel = require('../../../framework/platform/model/admin_model.js');
const MemberModel = require('../model/member_model.js');
const SmsCodeModel = require('../model/sms_code_model.js');
const dataUtil = require('../../../framework/utils/data_util.js');
const timeUtil = require('../../../framework/utils/time_util.js');
const md5Lib = require('../../../framework/lib/md5_lib.js');

class PassportService extends BaseProjectService {

	// 注册
	async register(userId, {
		mobile,
		name,
		password,
		forms,
		status
	}) {
		console.log('register called with userId:', userId, 'mobile:', mobile, 'name:', name);

		// 检查手机号是否已被注册
		let where = {
			USER_MOBILE: mobile
		}
		let cnt = await UserModel.count(where);
		console.log('existing user count by mobile:', cnt);
		
		if (cnt > 0) this.AppError('该手机号已被注册，请直接登录');

		// 入库 - 不自动绑定微信号，只使用手机号作为唯一标识
		let data = {
			USER_MOBILE: mobile,
			USER_NAME: name,
			USER_OBJ: dataUtil.dbForms2Obj(forms),
			USER_FORMS: forms,
			USER_STATUS: Number(status)
		}
		
		if (password) {
			data.USER_PASSWORD = md5Lib.md5(password);
			data.USER_PASSWORD_TIME = timeUtil.time();
		}
		
		console.log('inserting user data:', data);
		await UserModel.insert(data);

		return await this.loginByMobile(mobile);
	}

	/** 获取手机号码 */
	async getPhone(cloudID) {
		let cloud = cloudBase.getCloud();
		let res = await cloud.getOpenData({
			list: [cloudID], // 假设 event.openData.list 是一个 CloudID 字符串列表
		});
		if (res && res.list && res.list[0] && res.list[0].data) {

			let phone = res.list[0].data.phoneNumber;

			return phone;
		} else
			return '';
	}

	/** 取得我的用户信息 */
	async getMyDetail(mobile) {
		let where = {
			USER_MOBILE: mobile
		}
		let fields = 'USER_MOBILE,USER_NAME,USER_FORMS,USER_OBJ,USER_STATUS,USER_CHECK_REASON'
		return await UserModel.getOne(where, fields);
 
	}

	/** 修改用户资料 */
	async editBase(mobile, {
		newMobile,
		name,
		forms
	}) {
		let whereMobile = {
			USER_MOBILE: newMobile
		}
		let existingUser = await UserModel.getOne(whereMobile);
		if (existingUser && existingUser.USER_MOBILE !== mobile) {
			this.AppError('该手机已注册');
		}

		let where = {
			USER_MOBILE: mobile
		}

		let user = await UserModel.getOne(where);
		if (!user) return;

		let data = {
			USER_MOBILE: newMobile,
			USER_NAME: name,
			USER_OBJ: dataUtil.dbForms2Obj(forms),
			USER_FORMS: forms,
		};

		if (user.USER_STATUS == UserModel.STATUS.UNCHECK)
			data.USER_STATUS = UserModel.STATUS.UNUSE;

		await UserModel.edit(where, data);

	}

	/** 登录（通过token/手机号） */
	async login(userId) {
		let where = {
			USER_MOBILE: userId
		};
		let fields = 'USER_ID,USER_MOBILE,USER_NAME,USER_PIC,USER_STATUS';
		let user = await UserModel.getOne(where, fields);
		let token = {};
		if (user) {
			token.id = user.USER_MOBILE;
			token.key = user.USER_ID;
			token.name = user.USER_NAME;
			token.pic = user.USER_PIC;
			token.mobile = user.USER_MOBILE;
			token.status = user.USER_STATUS;

			await UserModel.edit(where, { USER_LOGIN_TIME: this._timestamp });
			UserModel.inc(where, 'USER_LOGIN_CNT', 1);
		} else
			token = null;

		return {
			token
		};
	}

	/** 微信手机号快捷登录 */
	async loginByWxPhone(code, openId) {
		console.log('loginByWxPhone called, code:', code, 'openId:', openId);

		if (!code) {
			this.AppError('缺少授权code');
		}

		let cloud = cloudBase.getCloud();
		let mobile;

		try {
			const res = await cloud.openapi.phonenumber.getPhoneNumber({
				code: code
			});
			console.log('getPhoneNumber result:', JSON.stringify(res));

			if (res.errCode !== 0 || !res.phoneInfo) {
				console.error('getPhoneNumber failed:', res);
				this.AppError('获取手机号失败: ' + (res.errMsg || '未知错误'));
			}

			mobile = res.phoneInfo.phoneNumber;
			console.log('mobile:', mobile);

		} catch (err) {
			console.error('getPhoneNumber error:', err);
			this.AppError('获取手机号失败: ' + (err.message || err));
		}

		if (!mobile) {
			this.AppError('获取手机号失败，请重试');
		}

		let where = {
			USER_MOBILE: mobile,
			USER_STATUS: UserModel.STATUS.COMM
		};
		let user = await UserModel.getOne(where);
		if (!user) {
			this.AppError('该手机号尚未注册');
		}

		if (openId && user.USER_MINI_OPENID !== openId) {
			let existUser = await UserModel.getOne({
				USER_MINI_OPENID: openId
			});
			if (existUser && existUser.USER_MOBILE !== mobile) {
				this.AppError('该微信号已绑定其他账号');
			}
			await UserModel.edit({ _id: user._id }, { 
				USER_MINI_OPENID: openId,
				USER_WX_BIND_TIME: timeUtil.time()
			});
		}

		let token = {
			id: user.USER_MOBILE,
			key: user.USER_ID,
			name: user.USER_NAME,
			pic: user.USER_PIC,
			mobile: user.USER_MOBILE,
			status: user.USER_STATUS
		};

		await UserModel.edit({ _id: user._id }, { USER_LOGIN_TIME: timeUtil.time() });
		await UserModel.inc({ _id: user._id }, 'USER_LOGIN_CNT', 1);

		return { token };
	}

	/** 手机号直接登录 */
	async loginByMobile(mobile) {
		if (!mobile || mobile.length !== 11) {
			this.AppError('请输入正确的手机号码');
		}

		let where = {
			USER_MOBILE: mobile,
			USER_STATUS: UserModel.STATUS.COMM
		};
		let user = await UserModel.getOne(where);
		if (!user) {
			this.AppError('该手机号尚未注册');
		}

		let token = {
			id: user.USER_MOBILE,
			key: user.USER_ID,
			name: user.USER_NAME,
			pic: user.USER_PIC,
			mobile: user.USER_MOBILE,
			status: user.USER_STATUS
		};

		await UserModel.edit({ _id: user._id }, { USER_LOGIN_TIME: timeUtil.time() });
		await UserModel.inc({ _id: user._id }, 'USER_LOGIN_CNT', 1);

		return { token };
	}

	/** 手机号+密码登录 */
	async loginByPassword(mobile, password) {
		if (!mobile || mobile.length !== 11) {
			this.AppError('请输入正确的手机号码');
		}
		if (!password) {
			this.AppError('请输入密码');
		}

		let where = {
			USER_MOBILE: mobile,
			USER_PASSWORD: md5Lib.md5(password),
			USER_STATUS: UserModel.STATUS.COMM
		};
		let user = await UserModel.getOne(where);
		if (!user) {
			this.AppError('手机号或密码错误');
		}

		let token = {
			id: user.USER_MOBILE,
			key: user.USER_ID,
			name: user.USER_NAME,
			pic: user.USER_PIC,
			mobile: user.USER_MOBILE,
			status: user.USER_STATUS
		};

		await UserModel.edit({ _id: user._id }, { USER_LOGIN_TIME: timeUtil.time() });
		await UserModel.inc({ _id: user._id }, 'USER_LOGIN_CNT', 1);

		return { token };
	}

	/** 手机号+验证码登录 */
	async loginBySms(mobile, code) {
		if (!mobile || mobile.length !== 11) {
			this.AppError('请输入正确的手机号码');
		}
		if (!code || code.length !== 6) {
			this.AppError('请输入6位验证码');
		}

		let now = timeUtil.time();
		let whereSms = {
			SMS_CODE_MOBILE: mobile,
			SMS_CODE_CODE: code,
			SMS_CODE_TYPE: 'login',
			SMS_CODE_USED: 0,
			SMS_CODE_EXPIRE_TIME: ['>=', now]
		};
		let smsCode = await SmsCodeModel.getOne(whereSms);
		if (!smsCode) {
			this.AppError('验证码错误或已过期');
		}

		await SmsCodeModel.edit({ _id: smsCode._id }, { SMS_CODE_USED: 1 });

		let where = {
			USER_MOBILE: mobile,
			USER_STATUS: UserModel.STATUS.COMM
		};
		let user = await UserModel.getOne(where);
		if (!user) {
			this.AppError('该手机号尚未注册');
		}

		let token = {
			id: user.USER_MOBILE,
			key: user.USER_ID,
			name: user.USER_NAME,
			pic: user.USER_PIC,
			mobile: user.USER_MOBILE,
			status: user.USER_STATUS
		};

		await UserModel.edit({ _id: user._id }, { USER_LOGIN_TIME: timeUtil.time() });
		await UserModel.inc({ _id: user._id }, 'USER_LOGIN_CNT', 1);

		return { token };
	}

	/** 发送验证码 */
	async sendSmsCode(mobile, type = 'login') {
		if (!mobile || mobile.length !== 11) {
			this.AppError('请输入正确的手机号码');
		}

		let now = timeUtil.time();
		let expireTime = now + 300;

		let whereCheck = {
			SMS_CODE_MOBILE: mobile,
			SMS_CODE_TYPE: type,
			SMS_CODE_ADD_TIME: ['>=', now - 60]
		};
		let recentCnt = await SmsCodeModel.count(whereCheck);
		if (recentCnt > 0) {
			this.AppError('验证码发送过于频繁，请60秒后再试');
		}

		let whereDay = {
			SMS_CODE_MOBILE: mobile,
			SMS_CODE_ADD_TIME: ['>=', now - 86400]
		};
		let dayCnt = await SmsCodeModel.count(whereDay);
		if (dayCnt >= 10) {
			this.AppError('今日发送次数已达上限，请明天再试');
		}

		let code = dataUtil.genRandomNum(100000, 999999).toString();

		let data = {
			SMS_CODE_MOBILE: mobile,
			SMS_CODE_CODE: code,
			SMS_CODE_TYPE: type,
			SMS_CODE_USED: 0,
			SMS_CODE_EXPIRE_TIME: expireTime
		};
		await SmsCodeModel.insert(data);

		let smsSent = false;
		try {
			let cloud = cloudBase.getCloud();
			if (cloud.openapi && cloud.openapi.cloudbase && cloud.openapi.cloudbase.sendSms) {
				await cloud.openapi.cloudbase.sendSms({
					env: cloud.DYNAMIC_CURRENT_ENV || process.env.ENV_ID,
					content: `【维修报修】您的验证码是${code}，5分钟内有效，请勿泄露给他人。`,
					phoneNumberList: [`+86${mobile}`]
				});
				smsSent = true;
			}
		} catch (err) {
			console.log('短信发送失败:', err.message || err);
		}

		if (!smsSent) {
			console.log(`[开发模式] 手机号: ${mobile}, 验证码: ${code}`);
		}

		return {
			success: true,
			hint: '验证码已发送',
			code: code
		};
	}

	/** 设置密码 */
	async setPassword(userId, password) {
		if (!password || password.length < 6) {
			this.AppError('密码长度不能少于6位');
		}

		let where = {
			USER_MOBILE: userId
		};
		let user = await UserModel.getOne(where);
		if (!user) {
			this.AppError('用户不存在');
		}

		let data = {
			USER_PASSWORD: md5Lib.md5(password),
			USER_PASSWORD_TIME: timeUtil.time()
		};
		await UserModel.edit(where, data);

		return { success: true };
	}

	/** 修改密码 */
	async changePassword(userId, oldPassword, newPassword) {
		if (!oldPassword) {
			this.AppError('请输入原密码');
		}
		if (!newPassword || newPassword.length < 6) {
			this.AppError('新密码长度不能少于6位');
		}

		let where = {
			USER_MOBILE: userId,
			USER_PASSWORD: md5Lib.md5(oldPassword)
		};
		let user = await UserModel.getOne(where);
		if (!user) {
			this.AppError('原密码错误');
		}

		let data = {
			USER_PASSWORD: md5Lib.md5(newPassword),
			USER_PASSWORD_TIME: timeUtil.time()
		};
		await UserModel.edit({ USER_MOBILE: userId }, data);

		return { success: true };
	}

	/** 重置密码(通过验证码) */
	async resetPassword(mobile, code, newPassword) {
		if (!mobile || mobile.length !== 11) {
			this.AppError('请输入正确的手机号码');
		}
		if (!code || code.length !== 6) {
			this.AppError('请输入6位验证码');
		}
		if (!newPassword || newPassword.length < 6) {
			this.AppError('密码长度不能少于6位');
		}

		let now = timeUtil.time();
		let whereSms = {
			SMS_CODE_MOBILE: mobile,
			SMS_CODE_CODE: code,
			SMS_CODE_TYPE: 'reset',
			SMS_CODE_USED: 0,
			SMS_CODE_EXPIRE_TIME: ['>=', now]
		};
		let smsCode = await SmsCodeModel.getOne(whereSms);
		if (!smsCode) {
			this.AppError('验证码错误或已过期');
		}

		await SmsCodeModel.edit({ _id: smsCode._id }, { SMS_CODE_USED: 1 });

		let where = {
			USER_MOBILE: mobile
		};
		let user = await UserModel.getOne(where);
		if (!user) {
			this.AppError('该手机号尚未注册');
		}

		let data = {
			USER_PASSWORD: md5Lib.md5(newPassword),
			USER_PASSWORD_TIME: timeUtil.time()
		};
		await UserModel.edit({ _id: user._id }, data);

		return { success: true };
	}

	/** 检查手机号是否已注册 */
	async checkMobileRegistered(mobile) {
		if (!mobile || mobile.length !== 11) {
			this.AppError('请输入正确的手机号码');
		}

		let where = {
			USER_MOBILE: mobile
		};
		let cnt = await UserModel.count(where);
		return {
			registered: cnt > 0
		};
	}

	/** 绑定用户微信号 */
	async bindUserWx(userId, openId) {
		if (!openId) {
			this.AppError('获取微信号失败');
		}

		let user = await UserModel.getOne({ USER_MOBILE: userId });
		if (!user) {
			this.AppError('用户不存在');
		}

		let existUser = await UserModel.getOne({
			USER_MINI_OPENID: openId
		});
		if (existUser && existUser.USER_MOBILE !== userId) {
			this.AppError('该微信号已被其他账号绑定');
		}

		let where = { USER_MOBILE: userId };
		let data = { 
			USER_MINI_OPENID: openId,
			USER_WX_BIND_TIME: timeUtil.time()
		};
		await UserModel.edit(where, data);

		return { success: true };
	}

	/** 解绑用户微信号 */
	async unbindUserWx(userId) {
		let user = await UserModel.getOne({ USER_MOBILE: userId });
		if (!user) {
			this.AppError('用户不存在');
		}

		if (user.USER_WX_UNBIND_TIME) {
			let unbindTime = user.USER_WX_UNBIND_TIME;
			let now = timeUtil.time();
			let cooldownDays = 7;
			let cooldownSeconds = cooldownDays * 24 * 60 * 60;
			
			if (now - unbindTime < cooldownSeconds) {
				let remainingDays = Math.ceil((cooldownSeconds - (now - unbindTime)) / (24 * 60 * 60));
				this.AppError(`解绑冷却中，还需等待 ${remainingDays} 天`);
			}
		}

		let where = { USER_MOBILE: userId };
		let data = { 
			USER_MINI_OPENID: '',
			USER_WX_UNBIND_TIME: timeUtil.time()
		};
		await UserModel.edit(where, data);

		return { success: true };
	}

	/** 自动登录检查 - 优先级: admin > member > user */
	async autoLoginCheck(openId) {
		if (!openId) {
			return { role: 'none' };
		}

		// 1. 检查管理员（保留微信绑定自动登录）
		let admin = await AdminModel.getOne({
			ADMIN_MINI_OPENID: openId,
			ADMIN_STATUS: 1
		}, 'ADMIN_ID,ADMIN_NAME,ADMIN_TYPE');

		if (admin) {
			let token = dataUtil.genRandomString(32);
			let tokenTime = timeUtil.time();
			let updateData = {
				ADMIN_TOKEN: token,
				ADMIN_TOKEN_TIME: tokenTime,
				ADMIN_LOGIN_TIME: timeUtil.time()
			};
			await AdminModel.edit({ _id: admin._id }, updateData);
			await AdminModel.inc({ _id: admin._id }, 'ADMIN_LOGIN_CNT', 1);

			return {
				role: 'admin',
				token,
				name: admin.ADMIN_NAME,
				type: admin.ADMIN_TYPE
			};
		}

		// 2. 检查工作人员（保留微信绑定自动登录）
		let member = await MemberModel.getOne({
			MEMBER_MINI_OPENID: openId,
			MEMBER_STATUS: MemberModel.STATUS.COMM
		}, 'MEMBER_ID,MEMBER_TITLE,MEMBER_CATE_ID,MEMBER_CATE_NAME');

		if (member) {
			let token = dataUtil.genRandomString(32);
			let tokenTime = timeUtil.time();
			let updateData = {
				MEMBER_TOKEN: token,
				MEMBER_TOKEN_TIME: tokenTime,
				MEMBER_LOGIN_TIME: timeUtil.time()
			};
			await MemberModel.edit({ _id: member._id }, updateData);
			await MemberModel.inc({ _id: member._id }, 'MEMBER_LOGIN_CNT', 1);

			return {
				role: 'member',
				id: member._id,
				token,
				name: member.MEMBER_TITLE,
				cateId: member.MEMBER_CATE_ID,
				cateName: member.MEMBER_CATE_NAME
			};
		}

		// 3. 普通用户不支持微信自动登录，需要手动输入手机号+密码/验证码
		return { role: 'none' };
	}


}

module.exports = PassportService;