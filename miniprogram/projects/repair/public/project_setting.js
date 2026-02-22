//"我要报修"页面各个条目的显示内容在这个文件里修改，具体逻辑在其他地方
const TASK_TYPE = ['电视维修', '冰箱维修', '水电维修', '其他'];

const SERVICE_PRODUCTS = [
    {
        id: 0,
        title: '电视维修',
        icon: '📺',
        desc: '专业电视维修服务，快速解决各类故障',
        prices: [
            { name: '上门检测费', price: '30元' },
            { name: '普通维修', price: '80元起' },
            { name: '主板维修', price: '200元起' },
            { name: '屏幕更换', price: '500元起' },
        ],
        contents: [
            '电视机无法开机故障排查与维修',
            '电视画面异常（花屏、条纹、黑屏）处理',
            '声音故障（无声、杂音）维修',
            '遥控器失灵、按键故障处理',
            '接口损坏、信号问题解决',
            '主板、电源板等核心部件维修更换',
        ],
        standards: [
            { title: '上门服务费', desc: '市区内上门服务费30元，郊区根据距离另议' },
            { title: '配件费用', desc: '更换配件按实际成本收费，配件价格透明公开' },
            { title: '保修期限', desc: '维修后同故障保修90天，更换配件保修180天' },
            { title: '支付方式', desc: '支持微信、支付宝、现金等多种支付方式' },
        ],
        tips: '维修前请提前备份数据，贵重物品请自行保管。维修完成后请验收确认再付款。'
    },
    {
        id: 1,
        title: '冰箱维修',
        icon: '🧊',
        desc: '冰箱制冷故障、漏水、异响等问题专业维修',
        prices: [
            { name: '上门检测费', price: '30元' },
            { name: '制冷系统维修', price: '150元起' },
            { name: '压缩机更换', price: '400元起' },
            { name: '温控器更换', price: '100元起' },
        ],
        contents: [
            '冰箱不制冷、制冷效果差故障维修',
            '冰箱漏水、结冰严重问题处理',
            '冰箱异响、噪音大问题解决',
            '温控器、传感器故障维修更换',
            '压缩机、冷凝器等核心部件维修',
            '门封条老化更换、密封性修复',
        ],
        standards: [
            { title: '上门服务费', desc: '市区内上门服务费30元，郊区根据距离另议' },
            { title: '配件费用', desc: '更换配件按实际成本收费，配件价格透明公开' },
            { title: '保修期限', desc: '维修后同故障保修90天，更换配件保修180天' },
            { title: '支付方式', desc: '支持微信、支付宝、现金等多种支付方式' },
        ],
        tips: '维修前请清空冰箱内物品，保持冰箱周围空间便于操作。维修完成后建议静置2小时再通电。'
    },
    {
        id: 2,
        title: '水电维修',
        icon: '🔧',
        desc: '水管漏水、电路故障、开关插座等问题维修',
        prices: [
            { name: '上门检测费', price: '30元' },
            { name: '水管维修', price: '60元起' },
            { name: '电路检修', price: '80元起' },
            { name: '开关插座更换', price: '50元起' },
        ],
        contents: [
            '水管漏水、水龙头更换维修',
            '马桶、洗手池堵塞疏通',
            '电路跳闸、短路故障排查',
            '开关、插座损坏更换',
            '灯具安装、更换维修',
            '热水器、洗衣机水电安装',
        ],
        standards: [
            { title: '上门服务费', desc: '市区内上门服务费30元，郊区根据距离另议' },
            { title: '材料费用', desc: '使用材料按实际用量收费，材料价格透明公开' },
            { title: '保修期限', desc: '水电维修保修180天，材料质保按厂家规定' },
            { title: '支付方式', desc: '支持微信、支付宝、现金等多种支付方式' },
        ],
        tips: '水电维修涉及安全，请确保维修人员持证上岗。维修完成后请检查确认无渗漏、无漏电。'
    },
    {
        id: 3,
        title: '其他维修',
        icon: '🛠️',
        desc: '空调、洗衣机、热水器等家电维修服务',
        prices: [
            { name: '上门检测费', price: '30元' },
            { name: '空调维修', price: '100元起' },
            { name: '洗衣机维修', price: '80元起' },
            { name: '热水器维修', price: '80元起' },
        ],
        contents: [
            '空调不制冷、漏水、异响维修',
            '洗衣机不转、不排水、异响处理',
            '热水器不加热、漏水故障维修',
            '微波炉、电磁炉、电饭煲维修',
            '油烟机清洗、维修服务',
            '其他小家电故障维修',
        ],
        standards: [
            { title: '上门服务费', desc: '市区内上门服务费30元，郊区根据距离另议' },
            { title: '配件费用', desc: '更换配件按实际成本收费，配件价格透明公开' },
            { title: '保修期限', desc: '维修后同故障保修90天，更换配件保修180天' },
            { title: '支付方式', desc: '支持微信、支付宝、现金等多种支付方式' },
        ],
        tips: '如有特殊维修需求，请提前电话沟通确认。部分老旧机型配件可能需要订购，请耐心等待。'
    }
];

module.exports = {
    PROJECT_COLOR: '#0055BE',
    NAV_COLOR: '#ffffff',
    NAV_BG: '#0055BE',

    SETUP_CONTENT_ITEMS: [
        { title: '关于我们', key: 'SETUP_CONTENT_ABOUT' },
    ],

    USER_REG_CHECK: false,
    USER_FIELDS: [
        { mark: 'commonAddress', title: '常用地址', type: 'textarea', must: false },
    ],

    NEWS_NAME: '通知公告',
    NEWS_CATE: [
        { id: 1, title: '通知公告', style: 'leftbig1' },
    ],
    NEWS_FIELDS: [],


    TASK_NAME: '报修',
    TASK_TYPE: TASK_TYPE,
    SERVICE_PRODUCTS: SERVICE_PRODUCTS,
    TASK_FIELDS: [
        { mark: 'type', title: '报修类型', type: 'select', selectOptions: TASK_TYPE, must: true },
        { mark: 'person', title: '联系人', type: 'text', must: true },
        { mark: 'phone', title: '联系电话', type: 'text', must: true },
        { mark: 'address', title: '报修地点', type: 'textarea', must: true },
        { mark: 'desc', title: '报修详情', type: 'textarea', must: true },
        { mark: 'img', type: 'image', title: '相关图片', max: 8 },
    ],

    TASK_QUOTE_FIELDS: [
        { mark: 'chargeDesc', title: '收费情况说明', type: 'textarea', must: true },
        { mark: 'chargeAmount', title: '收费金额(元)', type: 'digit', must: true },
        { mark: 'content', title: '情况说明', type: 'textarea', must: false },
        { mark: 'img', type: 'image', title: '相关图片', max: 8 },
    ],

    TASK_RUN_FIELDS: [
        { mark: 'content', title: '情况说明', type: 'textarea', must: false },
        { mark: 'img', type: 'image', title: '相关图片', max: 8 },
    ],

    TASK_OVER_FIELDS: [
        { mark: 'content', title: '完成情况说明', type: 'textarea', must: true },
        { mark: 'img', type: 'image', title: '相关图片', max: 8, must: true },
    ],

    TASK_COMMENT_FIELDS: [
        { mark: 'content', title: '评价内容', type: 'textarea', must: true },
        { mark: 'img', type: 'image', title: '相关图片', max: 8 },
    ],


    MEMBER_NAME: '工作人员',
    MEMBER_CATE: [
        { id: 1, title: '客服部' },
        { id: 2, title: '维修部' },
    ],
    MEMBER_FIELDS: [
        { mark: 'phone', title: '服务电话', type: 'text', ext: { hint: '用于展示给报修用户' }, must: false },
        { mark: 'img', type: 'image', title: '头像', max: 1 },
    ],


}
