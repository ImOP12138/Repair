/**
 * Notes: 短信验证码实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2024-01-01
 */

const BaseProjectModel = require('./base_project_model.js');
class SmsCodeModel extends BaseProjectModel { }

SmsCodeModel.CL = BaseProjectModel.C('sms_code');

SmsCodeModel.DB_STRUCTURE = {
	_pid: 'string|true',
	SMS_CODE_ID: 'string|true',

	SMS_CODE_MOBILE: 'string|true|comment=手机号',
	SMS_CODE_CODE: 'string|true|comment=验证码',
	SMS_CODE_TYPE: 'string|true|comment=类型 login/reset',
	SMS_CODE_USED: 'int|true|default=0|comment=是否已使用 0=否 1=是',

	SMS_CODE_ADD_TIME: 'int|true',
	SMS_CODE_EXPIRE_TIME: 'int|true|comment=过期时间',
}

SmsCodeModel.FIELD_PREFIX = "SMS_CODE_";

SmsCodeModel.TYPE = {
	LOGIN: 'login',
	RESET: 'reset'
}

module.exports = SmsCodeModel;
