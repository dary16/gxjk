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
    activeIndex: 0
}