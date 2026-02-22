/**
 * Notes: 短信验证码服务
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2024-01-01
 */

const BaseProjectService = require('./base_project_service.js');
const SmsCodeModel = require('../model/sms_code_model.js');
const timeUtil = require('../../../framework/utils/time_util.js');
const dataUtil = require('../../../framework/utils/data_util.js');
const cloudBase = require('../../../framework/cloud/cloud_base.js');

class SmsService extends BaseProjectService {

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

		await this._sendSmsByCloud(mobile, code);

		return {
			success: true,
			hint: '验证码已发送'
		};
	}

	async _sendSmsByCloud(mobile, code) {
		try {
			let cloud = cloudBase.getCloud();
			await cloud.openapi.cloudbase.sendSms({
				env: cloud.DYNAMIC_CURRENT_ENV,
				content: `【维修报修】您的验证码是${code}，5分钟内有效，请勿泄露给他人。`,
				phoneNumberList: [`+86${mobile}`]
			});
		} catch (err) {
			console.log('短信发送失败，开发环境模拟发送:', err);
			console.log(`[模拟短信] 手机号: ${mobile}, 验证码: ${code}`);
		}
	}

	async verifySmsCode(mobile, code, type = 'login') {
		if (!mobile || mobile.length !== 11) {
			this.AppError('请输入正确的手机号码');
		}
		if (!code || code.length !== 6) {
			this.AppError('请输入6位验证码');
		}

		let now = timeUtil.time();
		let where = {
			SMS_CODE_MOBILE: mobile,
			SMS_CODE_CODE: code,
			SMS_CODE_TYPE: type,
			SMS_CODE_USED: 0,
			SMS_CODE_EXPIRE_TIME: ['>=', now]
		};

		let smsCode = await SmsCodeModel.getOne(where);
		if (!smsCode) {
			this.AppError('验证码错误或已过期');
		}

		await SmsCodeModel.edit({ _id: smsCode._id }, { SMS_CODE_USED: 1 });

		return { success: true };
	}
}

module.exports = SmsService;
