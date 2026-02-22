/**
 * Notes:  健康监测实体
 * Ver : CCMiniCloud Framework 2.0.1 ALL RIGHTS RESERVED BY cclinux0730 (wechat)
 * Date: 2022-08-12 19:20:00 
 */


const BaseProjectModel = require('./base_project_model.js');

class TaskModel extends BaseProjectModel {

}

// 集合名
TaskModel.CL = BaseProjectModel.C('task');

TaskModel.DB_STRUCTURE = {
	_pid: 'string|true',
	TASK_ID: 'string|true',

	TASK_TYPE: 'int|true|default=0|comment=类型 0=用户创建，1=系统创建',
  
	TASK_USER_ID: 'string|false|comment=用户ID',
	TASK_USER_MOBILE: 'string|false|comment=用户手机号',

	TASK_STATUS: 'int|true|default=0|comment=状态 0=待派工,1=已派工,2=待用户确认,3=处理中,9=已完成,10=已取消',
      
	TASK_FORMS: 'array|true|default=[]', 
	TASK_OBJ: 'object|true|default={}', 

	TASK_MEMBER_ID: 'string|false|comment=工作人员ID', 
	TASK_MEMBER_NAME: 'string|false',
	TASK_MEMBER_PHONE: 'string|false',
	TASK_MEMBER_CATE_NAME: 'string|false|comment=工作人员分类',
	TASK_MEMBER_CATE_ID: 'string|false|comment=工作人员分类ID',
	TASK_MEMBER_TIME: 'int|true|default=0|comment=工作人员派工时间',


	TASK_QUOTE_FORMS: 'array|true|default=[]|comment=报价表单',
	TASK_QUOTE_OBJ: 'object|true|default={}|comment=报价对象',
	TASK_QUOTE_TIME: 'int|true|default=0|comment=报价时间',
	TASK_QUOTE_CONFIRM: 'int|true|default=0|comment=报价确认状态 0=待确认,1=已确认,2=已取消',

	TASK_RUN_FORMS: 'array|true|default=[]',
	TASK_RUN_OBJ: 'object|true|default={}',
	TASK_RUN_TIME: 'int|true|default=0',

	TASK_OVER_FORMS: 'array|true|default=[]',
	TASK_OVER_OBJ: 'object|true|default={}',
	TASK_OVER_TIME: 'int|true|default=0',

	TASK_COMMENT_FORMS: 'array|true|default=[]',
	TASK_COMMENT_OBJ: 'object|true|default={}',
	TASK_COMMENT_TIME: 'int|true|default=0',
	TASK_COMMENT_STATUS: 'int|true|default=0',


	TASK_MEMBER_ADMIN_ID: 'string|false',
	TASK_MEMBER_ADMIN_NAME: 'string|false',

	TASK_ADD_TIME: 'int|true',
	TASK_EDIT_TIME: 'int|true',
	TASK_ADD_IP: 'string|false',
	TASK_EDIT_IP: 'string|false',
};

// 字段前缀
TaskModel.FIELD_PREFIX = "TASK_";

/**
 * 状态 0=待派工,1=已派工,2=待用户确认,3=处理中,9=已完成,10=已取消
 */
TaskModel.STATUS = {
	WAIT: 0,
	APPT: 1,
	QUOTE: 2,
	RUN: 3,
	OVER: 9,
	CANCEL: 10
};

TaskModel.STATUS_DESC = {
	WAIT: '待派工',
	APPT: '已派工',
	QUOTE: '待用户确认',
	RUN: '处理中',
	OVER: '已完成',
	CANCEL: '已取消'
};

TaskModel.QUOTE_CONFIRM = {
	PENDING: 0,
	CONFIRMED: 1,
	CANCELLED: 2
};




module.exports = TaskModel;