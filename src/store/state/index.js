/**
 * 参数说明
 * @userInfo 用户登录信息
 * @warningID 告警消息ID
 */
import {
    getLoc
} from '../../utils/common.js';
export default {
    userInfo: getLoc('userInfo') || {},
    saveName: getLoc('saveName') || "",
    userRole: getLoc('userRole') || "",
    usernameList: getLoc('usernameList') || [],
    getMsgTime: '',
    isRefresh: false,
    warnId: '',
    disptId: '',
    activeIndex: 0,
    newMsgNum: 0, //所有列表下标提示有新数据时的红点标识
    warningNum: null, //系统告警未处理
    dispatchpoliceNum: null, //监控派警未处理数量
    handlingFaultNum: null, //设备故障(运维)未处理数量
    foundFaultNum: null, //设备故障(操作)未处理数量
    appSensorError: false, //摄像头是否可播放视频
    pointArr: [], //巡线工轨迹
    xxgStatus: 'normal', //巡线工的状态三种:normal,start,end
    // 酒泉现场 
    // urlCasWsWeb: {
    //     webUrl: 'https://jqtowermonitor.com',
    //     wsUrl: 'wss://jqtowermonitor.com',
    //     casUrl: 'https://jqtowermonitor.com:10083',
    // },
    //仿真
    urlCasWsWeb: {
        // webUrl: 'http://monitor.chinatowercom.cn:8080',
        // wsUrl: 'ws://monitor.chinatowercom.cn:8080',
        // casUrl: 'https://cas.chinatowercom.cn:10082',
        webUrl: 'http://192.168.200.31:8080',
        wsUrl: 'ws://192.168.200.31:8080',
        casUrl: 'https://192.168.15.205:10082',
    },
    // 延安
    // urlCasWsWeb: {
    //     webUrl: 'https://pipelinemonitor.cn',
    //     wsUrl: 'wss://pipelinemonitor.cn',
    //     casUrl: 'https://pipelinemonitor.cn:10083'
    // },
}