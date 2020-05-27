window.onload = function() {
    var _root = document.documentElement,
        resizeEvent = 'orientationchange' in window ? 'orientationchange' : 'resize',
        resizeCallback = function() {
            _root.style.fontSize = parseInt(_root.clientWidth / 7.5) + 'px';
            document.body && (document.body.style.fontSize = 0.16 + 'rem');
        };

    if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', resizeCallback, false);
        resizeCallback();
        window.addEventListener(resizeEvent, resizeCallback, false);
    }
}
window.onresize = function() {
    if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
        let ele = document.activeElement;
        setTimeout(() => {
            ele.scrollIntoView(); //焦点元素滚到可视区域的问题
        }, 0);
    }
}


export function formatDate(time, type) {
    let format = '';
    let data = '';

    if (time) {
        data = new Date(parseInt(time));
    } else {
        data = new Date();
    }

    var o = {
        'M+': data.getMonth() + 1, //月份
        'd+': data.getDate(), //日
        'h+': data.getHours(), //小时
        'm+': data.getMinutes(), //分
        's+': data.getSeconds() //秒
    };

    format = type == 1 ? 'hh:mm:ss' : type == 2 ? 'yyyy-MM-dd' : type == 3 ? 'yyyy-MM-dd hh:mm:ss' : type == 4 ? 'yyyy-MM' : type == 5 ? 'MM' : type == 6 ? 'yyyy' : type == 7 ? 'hh:mm' : type == 8 ? 'yyyyMMdd' : 'yyyy-MM-dd hh:mm';

    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (data.getFullYear() + '').substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp('(' + k + ')').test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
        }
    }
    return format;
}

export function getPostData(name, arr) {
    let type = "";
    if (name == "login" || name == "checkPassword" || name == "modifyPassword" || name == "getSystemTime" || name == "getAPPLatestEdition" || name == 'getUserInfo') {
        type = "login";
    } else if (name == "findUserRole" || name == "isPermission" || name == "checkIsPatrolman" || name == "findPatrolmans" || name == "getAllUntreatedInfoNum") {
        type = "user";
    } else if (name == "findNewDispatchPoliceNum" || name == "preAddDispatchPolice" || name == "viewDispatchPolice" || name == "findDispatchPolice" || name == "addDispatchPolice" || name == "uploadDispatchVerifyImage" || name == "checkIsReceipt" || name == "viewDispatchPolicePhoto") {
        type = "dispatchpolice";
    } else if (name == "findSensorFaultInfo" || name == "getSensorFaultInfoByfaultID" || name == "receiveSensorFaultInfo" || name == "handleSensorFaultInfo" || name == "confirmSensorFaultInfo" || name == "findSensorFaultInfoNotViewNum") {
        type = "sensorfaultinfo";
    } else if (name == "getSiteInfoByUserID" || name == "getSensorBySiteID" || name == "dayNightCountData" || name == "perCarCountData" || name == "regionTypeCountData" || name == "depthOfBuriedPipeCountData") {
        type = "statisticschart";
    } else if (name == "findWarningList" || name == "findDispatchPersonListByDispatchPoliceID" || name == "dealWarning" || name == "findNewWarningNum" || name == "getWarningInfoByID" || name == "getImageInfo") {
        type = "warning";
    } else if (name == "findSensorList") {
        type = "sensor"
    } else if (name = "insertClockInfo") {
        type = "linewalkerclock"
    }
    var postdata = `<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.${type}.webservice.application.gds/"><soapenv:Header/><soapenv:Body>` +
        getParams(name, arr) +
        `</soapenv:Body></soapenv:Envelope>`;
    return postdata;
}

export function getPostObjData(name, arr) {
    let type = "";
    if (name == "loginSensor" || "logOutSensor" || "eightDirectionTurn" || "zoom" || "focus") {
        type = "sensoroperation";
    } else {
        return false;
    }
    var postdata = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://service.' + type + '.webservice.application.gds/">' +
        '<soapenv:Header/>' +
        '<soapenv:Body>' +
        getObjParams(name, arr) +
        '</soapenv:Body>' +
        '</soapenv:Envelope>';
    return postdata;
}
//校验密码，修改密码，校验资源
export function getObjParams(name, arr) {
    let str = '<ser:' + name + '>';
    for (let index in arr) {
        str += '<' + index + '>' + arr[index] + '</' + index + '>';
    };
    str += '</ser:' + name + '>';
    return str;
}

export function getParams(name, arr) {
    if (arr instanceof Array) {
        let str;
        if (arr.length == 0) {
            // str = '<ser:' + name + '>' + '</ser:' + name + '>';
            str = `<ser:${name}/>`;
        } else {
            str = `<ser:${ name } >`;
            arr.forEach((item, index) => {
                str += '<arg' + index + '>' + item + '</arg' + index + '>';
            });
            str = str + '</ser:' + name + '>';
        }
        return str;
    } else if (typeof arr == 'string') {
        let str = '<ser:' + name + '>' + '<arg0>' + arr + '</arg0>' + '</ser:' + name + '>';
        return str;
    } else {
        //参数为对象
        var arrNew = [];
        let str = '<ser:' + name + '>' + '<arg0>' + JSON.stringify(arr) + '</arg0>' + '</ser:' + name + '>';

        return str;
    }
}
//set local
export function setLoc(k, val) {
    if (typeof val == 'string') {
        localStorage.setItem(k, val);
        return val;
    }
    localStorage.setItem(k, JSON.stringify(val));
    return val;
}

//get local
export function getLoc(k) {
    let uu = localStorage.getItem(k);

    try {
        if (typeof JSON.parse(uu) != 'number') {
            uu = JSON.parse(uu);
        }
    } catch (e) {}
    return uu;
}

//通过经纬度获取详细地址