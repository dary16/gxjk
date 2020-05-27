import axios from 'axios';
// 仿真测试
// const apiUrl = 'http://monitor.chinatowercom.cn:8080';

// 酒泉现场
// const apiUrl = 'https://jqtowermonitor.com';
// //延安现场
const apiUrl = 'https://pipelinemonitor.cn';
const api = {
    /*********************login start*************************/
    //登录接口
    login: 'loginWebService/login',
    //校验原密码接口
    checkPassword: 'loginWebService/checkPassword',
    //保存新密码接口
    modifyPassword: 'loginWebService/modifyPassword',
    //获取服务器时间
    getSystemTime: 'loginWebService/getSystemTime',
    //获取服务器版本
    getAPPLatestEdition: 'loginWebService/getAPPLatestEdition',
    //获取用户信息
    getUserInfo: 'loginWebService/getUserInfo',
    /*********************login end*************************/

    /*********************user start*************************/
    //获取角色
    findUserRole: 'userWebService/findUserRole',
    //资源权限判断
    isPermission: 'userWebService/isPermission',
    //巡线工判断
    checkIsPatrolman: 'userWebService/checkIsPatrolman',
    //系统告警选择巡线工列表
    findPatrolmans: 'userWebService/findPatrolmans',
    //未处理消息总数
    getAllUntreatedInfoNum: 'userWebService/getAllUntreatedInfoNum',
    /*********************user end*************************/

    /*********************dispatchpolice start*************************/
    //监控派警列表页面
    findDispatchPolice: 'dispatchWebService/findDispatchPolice',
    //监控派警新消息总数
    findNewDispatchPoliceNum: 'dispatchWebService/findNewDispatchPoliceNum',
    //添加数据
    addDispatchPolice: 'dispatchWebService/addDispatchPolice',
    //准备添加数据
    preAddDispatchPolice: 'dispatchWebService/preAddDispatchPolice',
    //查看回执
    viewDispatchPolice: 'dispatchWebService/viewDispatchPolice',
    //查看派警图片
    viewDispatchPolicePhoto: 'dispatchWebService/viewDispatchPolicePhoto',
    //上传图片
    uploadDispatchVerifyImage: 'dispatchWebService/uploadDispatchVerifyImage',
    //检查是否已被回执
    checkIsReceipt: 'dispatchWebService/checkIsReceipt',
    //巡线工打卡
    insertClockInfo: 'clockWebService/insertClockInfo',
    /*********************dispatchpolice end*************************/

    /*********************warning start*************************/
    //系统告警列表页面
    findWarningList: 'warningWebService/findWarningList',
    //系统告警获取新消息集合
    findNewWarningNum: 'warningWebService/findNewWarningNum',
    //获取告警信息
    getWarningInfoByID: 'warningWebService/getWarningInfoByID',
    //获取告警图片
    getImageInfo: 'warningWebService/getImageInfo',
    //处理告警
    dealWarning: 'warningWebService/dealWarning',
    //已派警的查看派警时间和人员
    findDispatchPersonListByDispatchPoliceID: 'warningWebService/findDispatchPersonListByDispatchPoliceID',
    /*********************warning end*************************/


    /*********************sensorfaultinfo start*************************/
    //故障列表
    findSensorFaultInfo: 'sensorFaultInfoWebService/findSensorFaultInfo',
    //获取故障详情
    getSensorFaultInfoByfaultID: 'sensorFaultInfoWebService/getSensorFaultInfoByfaultID',
    //接收故障
    receiveSensorFaultInfo: 'sensorFaultInfoWebService/receiveSensorFaultInfo',
    //处理故障
    handleSensorFaultInfo: 'sensorFaultInfoWebService/handleSensorFaultInfo',
    //确认故障
    confirmSensorFaultInfo: 'sensorFaultInfoWebService/confirmSensorFaultInfo',
    //故障新消息
    findSensorFaultInfoNotViewNum: 'sensorFaultInfoWebService/findSensorFaultInfoNotViewNum',
    /*********************sensorfaultinfo end*************************/

    /*********************statisticschart start*************************/
    //获取某一用户所管站点信息
    getSiteInfoByUserID: 'statisticsWebService/getSiteInfoByUserID',
    //获取某一个站点下的摄像头信息
    getSensorBySiteID: 'statisticsWebService/getSensorBySiteID',
    //统计白天、晚上的告警数据
    dayNightCountData: 'statisticsWebService/dayNightCountData',
    //统计人、车的告警数据
    perCarCountData: 'statisticsWebService/perCarCountData',
    //统计各个地区的告警数据
    regionTypeCountData: 'statisticsWebService/regionTypeCountData',
    //统计埋管深度告警数据
    depthOfBuriedPipeCountData: 'statisticsWebService/depthOfBuriedPipeCountData',
    /*********************statisticschart end*************************/

    /*********************surveillanceVideo start*************************/
    //获取视频监控列表
    findSensorList: 'sensorWebService/findSensorList',
    //登录所要控制的摄像头
    loginSensor: 'sensorOperation/loginSensor',
    //退出所要控制的摄像头
    logOutSensor: 'sensorOperation/logOutSensor',
    //控制摄像头8个方向
    eightDirectionTurn: 'sensorOperation/eightDirectionTurn',
    //控制摄像头变倍
    zoom: 'sensorOperation/zoom',
    //控制摄像头变焦
    focus: 'sensorOperation/focus',
    /*********************surveillanceVideo end*************************/

}

for (var k in api) {

    if (process.env.NODE_ENV == 'development') {
        // api[k] = 'http://192.168.200.199/webservice/' + api[k];
        axios.baseURL = '/webService/';
        api[k] = '/webService/' + api[k];

    } else {
        //仿真测试环境
        // axios.baseURL = 'http://monitor.chinatowercom.cn:8080/webService';
        // api[k] = 'http://monitor.chinatowercom.cn:8080/webService/' + api[k];
        // axios.baseURL = apiUrl + '/webService';
        // api[k] = apiUrl + '/webService/' + api[k];
        //酒泉现场
        // axios.baseURL = 'https://jqtowermonitor.com/webService';
        // api[k] = 'https://jqtowermonitor.com/webService/' + api[k];

        //IP
        axios.baseURL = 'http://192.168.200.31:8080/webService';
        api[k] = 'http://192.168.200.31:8080/webService/' + api[k];

        //延安现场
        // axios.baseURL = 'https://pipelinemonitor.cn/webService';
        // api[k] = 'https://pipelinemonitor.cn/webService/' + api[k];
    }
}
export default api;