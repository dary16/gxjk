//获取浏览器信息
var browser = {
    ua: function () {
        var u = navigator.userAgent;
        var isChrome = u.match(/Chrome\/([\d.]+)/) ||
            u.match(/CriOS\/([\d.]+)/);
        var isAndroid = u.match(/(Android);?[\s\/]+([\d.]+)?/);
        var iosVersion = function () {
            if (/iP(hone|od|ad)/.test(navigator.platform)) {
                var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
                return [parseInt(v[1], 10), parseInt(v[2], 10),
                    parseInt(v[3] || 0, 10)
                ];
            }
        }();
        var chromeVersion = function () {
            var chrome = navigator.userAgent.match(/Chrome\/(\d+)\./);
            if (chrome) {
                return parseInt(chrome[1], 10);
            }
        }();
        var ios9 = iosVersion && iosVersion[0] >= 9;
        var chrome18 = isChrome && isAndroid && chromeVersion &&
            chromeVersion > 18;
        return { // 移动终端浏览器版本信息
            trident: u.indexOf('Trident') > -1, // IE内核
            presto: u.indexOf('Presto') > -1, // opera内核
            webKit: u.indexOf('AppleWebKit') > -1, // 苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, // 火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), // 是否为移动终端
            iOS: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), // ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, // android终端或uc浏览器
            iPhone: u.indexOf('iPhone') > -1, // 是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, // 是否iPad
            webApp: u.indexOf('Safari') == -1, // 是否web应该程序，没有头部与底部
            weChat: u.indexOf('MicroMessenger') > -1,
            UC: u.indexOf('UCBrowser') > -1,
            u3: u.indexOf('U3') > -1,
            chrome: u.indexOf('Chrome') > -1,
            windowsPhone: u.indexOf("Windows Phone") > -1,
            samsung: u.indexOf("Samsung") > -1,
            QQ: (u.match(/\sQQ/i) != null ? u.match(/\sQQ/i).toLowerCase() == " qq" :
                false),
            isChrome: isChrome,
            isAndroid: isAndroid,
            iosVersion: iosVersion,
            chromeVersion: chromeVersion,
            ios9: ios9,
            chrome18: chrome18
        };
    }()
}
var ua = browser.ua;

// 打开地图App，开始导航
export function openMapApp(lat, lng, addr, maps) {
    // 地图uri api数组
    var uri = "";
    if (ua.android) {
        if (maps == "com.baidu.BaiduMap") {
            // 百度地图uri api
            uri = "baidumap://map/navi?location=" + lat + "," + lng + "&query=" + addr;
        } else if (maps == "com.autonavi.minimap") {
            // 高德地图uri api
            uri = "androidamap://navi?sourceApplication=xlwx&poiname=" + addr +
                "&lat=" + lat + "&lon=" + lng + "&dev=1&style=2";
        } else if (maps == "com.tencent.map") {
            // 腾讯地图uri api
            uri = "qqmap://map/marker?marker=coord:" + lat + "," + lng +
                ";title:" + addr + "&referer=xlwx";
        } else if (maps == "com.tencent.map.download") {
            // 腾讯地图uri api
            uri = "https://mapdownload.map.qq.com/index?autoDownload=false";
        }
    } else if (ua.iOS) {
        if (maps == "com.baidu.BaiduMap") {
            // 百度地图uri api
            uri = "baidumap://map/navi?location=" + lat + "," + lng + "&query=" +
                addr;
        } else if (maps == "com.autonavi.minimap") {
            // 高德地图uri api
            uri = "iosamap://navi?sourceApplication=xlwx&poiname=" + addr +
                "&lat=" + lat + "&lon=" + lng + "&dev=1&style=2";
        } else if (maps == "com.tencent.map") {
            // 腾讯地图uri api
            uri = "qqmap://map/marker?marker=coord:" + lat + "," + lng +
                ";title:" + addr + "&referer=xlwx";
        } else if (maps == "com.tencent.map.download") {
            // 腾讯地图uri api
            //uri = "market://details?id=" + "com.tencent.map";
            uri = "https://mapdownload.map.qq.com/index?autoDownload=false";
        }
        /*else if () {
                   //苹果地图uri api
                   uri = "http://maps.apple.com/?sll=" + lat + "," + lng + "&address=" +
                       addr;
               }*/
    }
    if (uri == "") {
        return
    }
    window.location.href = uri;
}