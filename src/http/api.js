import axios from 'axios';
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

}

for (var k in api) {
    if (process.env.NODE_ENV == 'development') {
        // api[k] = 'http://192.168.200.199/webservice/' + api[k];
        axios.baseURL = '/webService/';
        api[k] = '/webService/' + api[k];
    } else {
        axios.baseURL = 'http://192.168.15.205/webService/';
        api[k] = 'http://192.168.15.205/webService/' + api[k];
        // axios.baseURL = 'https://192.168.15.205/webService/';
        // api[k] = 'https://192.168.15.205/webService/' + api[k];
        // axios.baseURL = 'http://pipelinemonitor.cn/webservice/';
        // api[k] = 'http://pipelinemonitor.cn/webservice/' + api[k];
        // api[k] = '/webservice/' + api[k];
    }
}
export default api;