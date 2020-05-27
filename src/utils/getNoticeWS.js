import store from '../store';
import {
    getPostData,
    getLoc
} from '../utils/common.js';
import router from '../router';

export default {
    ws: {},
    flag: true,
    heartBeat: null, //心跳，定时像服务器发送信息证明存货
    setWs: function(newWs) {
        this.ws = newWs;
        this.ws.onopen = () => {
            console.log('连接已建立...');
            plus.push.addEventListener("receive", msg => {
                console.log("(receive):" + JSON.stringify(msg));
                var payload = JSON.parse(msg.payload);
                debugger;
                var messageTitle = payload.messageTitle;
                var messageContent = payload.messageContent;
                plus.push.createMessage(messageContent, msg.payload, {
                    title: messageTitle
                });
            }, false);
            //添加点击通知栏消息事件
            plus.push.addEventListener("click", msg => {
                if (msg.title === '系统告警') {
                    store.commit('_warnId', msg.payload);
                    router.push('/systemWarningInfo');
                } else if (msg.title === '监控派警') {
                    store.commit('_warnId', msg.payload);
                    router.push('/unfinishedDetails');
                } else if (msg.title === '设备故障（运维）') {
                    store.commit('_warnId', msg.payload);
                    router.push('/handlingfaultMessage');
                } else if (msg.title === '设备故障（操作）') {
                    store.commit('_warnId', msg.payload);
                    router.push('/foundfaultMessage');
                } else if (msg.title === '故障查询') {
                    store.commit('_warnId', msg.payload);
                    router.push('/searchFaultMessage');
                }
            }, false);
            //获取各项未处理最新消息数
            this.getUndoneNum();
            //连接错误
            this.ws.onerror = () => {
                console.log('错误');
            };
            //服务器向客户端发送的消息
            this.ws.onmessage = (res) => {
                console.log(res);
                if (res.data === '注销登录') {
                    this.flag = false;
                    this.recon();
                } else if (res.data === '保活') {
                    mui.toast('保活');
                } else {
                    //判断是什么消息以及是否请求到webserve后赋值
                    if (JSON.parse(res.data).messageType === 'appWarningNumChange' && store.state.warningNum !== null) {
                        //新增或减少告警数据时改变未处理总数
                        store.commit('_warningNum', {
                            warningChangeType: JSON.parse(res.data).warningChangeType,
                            warningNum: Number(JSON.parse(res.data).warningNum)
                        });
                        //循环此用户是否含有系统告警模块
                        getLoc('moduleAu').forEach(item => {
                            //有系统告警模块并且是新增告警则发送通知消息
                            if (item === '系统告警' && JSON.parse(res.data).warningChangeType == 'add') {
                                //新增时发送通知消息
                                let message = {
                                    title: '系统告警',
                                    content: '新增一条告警消息',
                                    warningID: JSON.parse(res.data).warningID
                                };
                                //调用action的发送消息异步方法
                                store.dispatch('_getMessage', message);
                            }
                        });
                    } else if (JSON.parse(res.data).messageType === 'appDispatchNumChange' && store.state.dispatchpoliceNum !== null) {
                        //新增或减少派警数据时改变未处理总数
                        store.commit('_dispatchpoliceNum', {
                            changeType: JSON.parse(res.data).changeType,
                            changeNum: Number(JSON.parse(res.data).changeNum)
                        });
                        //循环此用户是否含有监控派警模块
                        getLoc('moduleAu').forEach(item => {
                            //有此模块并新增时发送通知消息
                            if (item === '监控派警' && JSON.parse(res.data).changeType == 'add') {
                                let message = {
                                    title: '监控派警',
                                    content: '新增一条派警消息',
                                    warningID: JSON.parse(res.data).warningID
                                };
                                //调用action的发送消息异步方法
                                store.dispatch('_getMessage', message);
                            }
                        });
                    } else if (JSON.parse(res.data).messageType === 'appSensorFaultNumChange') {
                        if (JSON.parse(res.data).module === 'appYWGLY' && store.state.handlingFaultNum !== null) {
                            //新增或减少设备故障(运维)数据时改变未处理总数
                            store.commit('_handlingFaultNum', {
                                changeType: JSON.parse(res.data).changeType,
                                changeNum: Number(JSON.parse(res.data).changeNum)
                            });
                            //循环此用户是否含有设备故障(运维)模块
                            getLoc('moduleAu').forEach(item => {
                                //有此模块并新增时发送通知消息
                                if (item === '设备故障(运维)' && JSON.parse(res.data).changeType == 'add') {
                                    let message = {
                                        title: '设备故障（运维）',
                                        content: '新增一条设备故障（运维）信息',
                                        warningID: JSON.parse(res.data).faultID
                                    };
                                    //调用action的发送消息异步方法
                                    store.dispatch('_getMessage', message);
                                } else if (item === '故障查询' && JSON.parse(res.data).changeType == 'add' && getLoc('moduleAu').indexOf('设备故障(运维)') === -1) {
                                    let message = {
                                        title: '故障查询',
                                        content: '新增一条故障查询信息(已上报)',
                                        warningID: JSON.parse(res.data).faultID
                                    };
                                    //调用action的发送消息异步方法
                                    store.dispatch('_getMessage', message);
                                }
                            });
                        } else if (JSON.parse(res.data).module === 'appCZY' && store.state.foundFaultNum !== null) {
                            //新增或减少设备故障(操作)数据时改变未处理总数
                            store.commit('_foundFaultNum', {
                                changeType: JSON.parse(res.data).changeType,
                                changeNum: Number(JSON.parse(res.data).changeNum)
                            });
                            //循环此用户是否含有设备故障(操作)模块
                            getLoc('moduleAu').forEach(item => {
                                //有此模块并新增时发送通知消息
                                if (item === '设备故障(操作)' && JSON.parse(res.data).changeType == 'add') {
                                    let message = {
                                        title: '设备故障（操作）',
                                        content: '新增一条设备故障（操作）信息',
                                        warningID: JSON.parse(res.data).faultID
                                    };
                                    //调用action的发送消息异步方法
                                    store.dispatch('_getMessage', message);
                                } else if (item === '故障查询' && JSON.parse(res.data).changeType == 'add' && getLoc('moduleAu').indexOf('设备故障(操作)') === -1) {
                                    console.log('故障查询');
                                    let message = {
                                        title: '故障查询',
                                        content: '新增一条故障查询信息(已处理)',
                                        warningID: JSON.parse(res.data).faultID
                                    };
                                    //调用action的发送消息异步方法
                                    store.dispatch('_getMessage', message);
                                }
                            });
                        }
                    } else if (JSON.parse(res.data).messageType === 'appSensorStatus') {
                        store.commit('_appSensorError', true);
                    }
                }
            };
        };
        //当连接关闭时
        this.ws.onclose = () => {
            console.log("连接已关闭...");
            this.flag = true;
            this.recon();
        };
    },
    //连接关闭时调用的方法
    recon: function() {
        //如果为客户端主动关闭连接（注销登录）
        if (!this.flag) {
            console.log('注销登录，连接已关闭...');
            this.ws.onmessage = '';
            return;
        };
        //客户端网络异常或连接websocket异常断开重启连接
        this.flag = false;
    },
    //获取最新的各项未处理数
    getUndoneNum: function() {
        const apiData = [{
                api: 'findWarningList',
                arr: [getLoc('userInfo').userID, '未处理', 1, 1]
            },
            {
                api: 'findSensorFaultInfo',
                arr: {
                    userID: getLoc('userInfo').userID,
                    statuses: '已上报,已接收',
                    pageNum: 1,
                    pageSize: 1
                }
            },
            {
                api: 'findSensorFaultInfo',
                arr: {
                    userID: getLoc('userInfo').userID,
                    statuses: '已处理',
                    pageNum: 1,
                    pageSize: 1
                }
            },
            {
                api: 'findDispatchPolice',
                arr: [getLoc('userInfo').userID, '已派警,处理中', 1, 1]
            },
        ];
        for (let i = 0; i < apiData.length; i++) {
            const params = getPostData(apiData[i].api, apiData[i].arr);
            store.dispatch(
                '_getInfo', {
                    ops: params,
                    method: 'post',
                    api: apiData[i].api,
                    callback: res => {
                        var div = document.createElement('div');
                        div.innerHTML = res;
                        let data = JSON.parse(div.querySelector('return').innerHTML);
                        if (apiData[i].api == 'findWarningList') {
                            store.commit('_warningNum', data.total);
                        } else if (apiData[i].api == 'findSensorFaultInfo' && apiData[i].arr.statuses == '已上报,已接收') {
                            store.commit('_handlingFaultNum', data.total);
                        } else if (apiData[i].api == 'findSensorFaultInfo' && apiData[i].arr.statuses == '已处理') {
                            store.commit('_foundFaultNum', data.total);
                        } else if (apiData[i].api == 'findDispatchPolice') {
                            store.commit('_dispatchpoliceNum', data.total);
                        }
                    }
                });
        }
    },
}