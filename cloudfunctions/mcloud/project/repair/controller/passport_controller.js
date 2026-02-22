/** 
 * Notes: passport模块控制器
 * Date: 2021-03-15 19:20:00 
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 */

const BaseProjectController = require('./base_project_controller.js');
const PassportService = require('../service/passport_service.js');
const contentCheck = require('../../../framework/validate/content_check.js');

class PassportController extends BaseProjectController {

	/** 取得我的用户信息 */
	async getMyDetail() {
		let service = new PassportService();
		let userId = this._userId;
		return await service.getMyDetail(userId);
	}

	/** 获取手机号码（保留方法但前端不使用）*/
	async getPhone() {

		// 数据校验
		let rules = {
			cloudID: 'must|string|min:1|max:200|name=cloudID',
		};

		// 取得数据
		let input = this.validateData(rules);


		let service = new PassportService();
		return await service.getPhone(input.cloudID);
	}


	/** 注册 */
	async register() {
		// 数据校验
		let rules = {
			name: 'must|string|min:1|max:30|name=姓名',
			mobile: 'must|mobile|name=手机',
			password: 'string|min:6|max:30|name=密码',
			forms: 'array|name=表单',
			status: 'int|default=1'
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiClient(input);

		let service = new PassportService();
		return await service.register(this._userId, input);
	}

	/** 修改用户资料 */
	async editBase() {
		// 数据校验
		let rules = {
			name: 'must|string|min:1|max:30|name=姓名',
			mobile: 'must|mobile|name=手机',
			forms: 'array|name=表单',
		};

		// 取得数据
		let input = this.validateData(rules);

		// 内容审核
		await contentCheck.checkTextMultiClient(input);

		let service = new PassportService();
		let userId = this._userId;
		input.newMobile = input.mobile;
		return await service.editBase(userId, input);
	}

	/** 登录 */
	async login() {
		// 数据校验
		let rules = {};

		// 取得数据
		let input = this.validateData(rules);

		let service = new PassportService();
		return await service.login(this._userId);
	}

	/** 微信手机号快捷登录 */
	async loginByWxPhone() {
		let rules = {
			code: 'must|string|min:1|max:100|name=授权code'
		};
		let input = this.validateData(rules);

		let service = new PassportService();
		return await service.loginByWxPhone(input.code, this._openId);
	}

	/** 手机号直接登录（测试用） */
	async loginByMobile() {
		let rules = {
			mobile: 'must|mobile|name=手机号'
		};
		let input = this.validateData(rules);

		let service = new PassportService();
		return await service.loginByMobile(input.mobile);
	}

	/** 手机号+密码登录 */
	async loginByPassword() {
		let rules = {
			mobile: 'must|mobile|name=手机号',
			password: 'must|string|min:6|max:30|name=密码'
		};
		let input = this.validateData(rules);

		let service = new PassportService();
		return await service.loginByPassword(input.mobile, input.password);
	}

	/** 手机号+验证码登录 */
	async loginBySms() {
		let rules = {
			mobile: 'must|mobile|name=手机号',
			code: 'must|string|len:6|name=验证码'
		};
		let input = this.validateData(rules);

		let service = new PassportService();
		return await service.loginBySms(input.mobile, input.code);
	}

	/** 发送验证码 */
	async sendSmsCode() {
		let rules = {
			mobile: 'must|mobile|name=手机号',
			type: 'string|default=login|name=类型'
		};
		let input = this.validateData(rules);

		let service = new PassportService();
		return await service.sendSmsCode(input.mobile, input.type);
	}

	/** 设置密码 */
	async setPassword() {
		let rules = {
			password: 'must|string|min:6|max:30|name=密码'
		};
		let input = this.validateData(rules);

		let service = new PassportService();
		return await service.setPassword(this._userId, input.password);
	}

	/** 修改密码 */
	async changePassword() {
		let rules = {
			oldPassword: 'must|string|min:6|max:30|name=原密码',
			newPassword: 'must|string|min:6|max:30|name=新密码'
		};
		let input = this.validateData(rules);

		let service = new PassportService();
		return await service.changePassword(this._userId, input.oldPassword, input.newPassword);
	}

	/** 重置密码 */
	async resetPassword() {
		let rules = {
			mobile: 'must|mobile|name=手机号',
			code: 'must|string|len:6|name=验证码',
			newPassword: 'must|string|min:6|max:30|name=新密码'
		};
		let input = this.validateData(rules);

		let service = new PassportService();
		return await service.resetPassword(input.mobile, input.code, input.newPassword);
	}

	/** 检查手机号是否已注册 */
	async checkMobileRegistered() {
		let rules = {
			mobile: 'must|mobile|name=手机号'
		};
		let input = this.validateData(rules);

		let service = new PassportService();
		return await service.checkMobileRegistered(input.mobile);
	}

	/** 绑定用户微信号 */
	async bindUserWx() {
		let service = new PassportService();
		return await service.bindUserWx(this._userId, this._openId);
	}

	/** 解绑用户微信号 */
	async unbindUserWx() {
		let service = new PassportService();
		return await service.unbindUserWx(this._userId);
	}

	/** 自动登录检查 */
	async autoLoginCheck() {
		let service = new PassportService();
		return await service.autoLoginCheck(this._openId);
	}

}

module.exports = PassportController;