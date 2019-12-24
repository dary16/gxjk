import {
    setLoc
} from '../../utils/common.js';
export default {
    _userInfo(state, userInfo) {
        setLoc('userInfo', userInfo);
        state.userInfo = userInfo;
    },
    _saveName(state, saveName) {
        setLoc('saveName', saveName);
        state.saveName = saveName;
    },
    _usernameList(state, usernameList) {
        setLoc('usernameList', usernameList);
        state.usernameList = usernameList;
    },
    _userRole(state, userRole) {
        setLoc('userRole', userRole);
        state.userRole = userRole;
    },
    _getSystemWarningTime(state, getSystemWarningTime) {
        setLoc('getSystemWarningTime', getSystemWarningTime);
        state.getSystemWarningTime = getSystemWarningTime;
    },
    _getHandlingFaultTime(state, getHandlingFaultTime) {
        setLoc('getHandlingFaultTime', getHandlingFaultTime);
        state.getHandlingFaultTime = getHandlingFaultTime;
    },
    _getFoundFaultTime(state, getFoundFaultTime) {
        setLoc('getFoundFaultTime', getFoundFaultTime);
        state.getFoundFaultTime = getFoundFaultTime;
    },
    _getDispatchPoliceTime(state, getDispatchPoliceTime) {
        setLoc('getDispatchPoliceTime', getDispatchPoliceTime);
        state.getDispatchPoliceTime = getDispatchPoliceTime;
    },
    _isRefresh(state, isRefresh) {
        state.isRefresh = isRefresh;
    },
    _warnId(state, warnId) {
        setLoc('warnId', warnId);
        state.warnId = warnId;
    },
    _disptId(state, disptId) {
        setLoc('dispatchId', disptId);
        state.disptId = disptId;
    },
    _activeIndex(state, activeIndex) {
        state.activeIndex = activeIndex;
    }
}