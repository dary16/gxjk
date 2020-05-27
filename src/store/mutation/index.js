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
    },
    _newMsgNum(state, newMsgNum) {
        setLoc('newMsgNum', newMsgNum);
        state.newMsgNum = newMsgNum;
    },
    //系统告警未处理数量
    _warningNum(state, warning) {
        if (typeof(warning) === "number" || warning === null) {
            state.warningNum = warning;
        } else {
            if (warning.warningChangeType == 'add') {
                state.warningNum += warning.warningNum;
                console.log('新增一条告警');
            } else if (warning.warningChangeType == 'delete') {
                state.warningNum -= warning.warningNum;
                console.log('减少一条告警');
            }
        }
    },
    //监控派警未处理数量
    _dispatchpoliceNum(state, dispatchpolice) {
        if (typeof(dispatchpolice) === "number" || dispatchpolice === null) {
            state.dispatchpoliceNum = dispatchpolice;
        } else {
            if (dispatchpolice.changeType == 'add') {
                state.dispatchpoliceNum += dispatchpolice.changeNum;
                console.log('新增一条派警');
            } else if (dispatchpolice.changeType == 'delete') {
                state.dispatchpoliceNum -= dispatchpolice.changeNum;
                console.log('减少一条派警');
            }
        }
    },
    //设备故障(运维)未处理数量
    _handlingFaultNum(state, handlingFault) {
        if (typeof(handlingFault) === "number" || handlingFault === null) {
            state.handlingFaultNum = handlingFault;
        } else {
            if (handlingFault.changeType == 'add') {
                state.handlingFaultNum += handlingFault.changeNum;
                console.log('新增一条设备故障运维');
            } else if (handlingFault.changeType == 'delete') {
                state.handlingFaultNum -= handlingFault.changeNum;
                console.log('减少一条设备故障运维');
            }
        }
    },
    //设备故障(操作)未处理数量
    _foundFaultNum(state, foundFault) {
        if (typeof(foundFault) === "number" || foundFault === null) {
            state.foundFaultNum = foundFault;
        } else {
            if (foundFault.changeType == 'add') {
                state.foundFaultNum += foundFault.changeNum;
                console.log('新增一条设备故障操作');
            } else if (foundFault.changeType == 'delete') {
                state.foundFaultNum -= foundFault.changeNum;
                console.log('减少一条设备故障操作');
            }
        }
    },
    _getCheckFaultTime(state, getCheckFaultTime) {
        setLoc('getCheckFaultTime', getCheckFaultTime);
        state.getCheckFaultTime = getCheckFaultTime;
    },
    _appSensorError(state, appSensorError) {
        state.appSensorError = appSensorError;
    },
    _pointArr(state, pointArr) {
        setLoc('pointArr', pointArr);
        state.pointArr = pointArr;
    },
    _xxgStatus(state, xxgStatus) {
        setLoc('xxgStatus', xxgStatus);
        state.xxgStatus = xxgStatus;
    },
}