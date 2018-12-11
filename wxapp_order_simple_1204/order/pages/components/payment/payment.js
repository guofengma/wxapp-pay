/*
1、构造函数 说明
    参数   let payment= new  Payment(this);
    参数1：执行上下文 
2、组件使用：
   页面调用组件的话需要有变量(必须同名)
*/
const
    config = require('../../common/config.js'),
    origin = config.origin,
    keys = config.keys;
let sha1 = require('../../common/sha1.js');
class Payment {
    //构造
    constructor(page) {
        this.page = page;
    }

    bindEvents() {
        let page = this.page;
        //请求pay接口下单
        page.loadPay = (e) => {
            let member = page.data.member,
                price = page.data.price;
            if (!member || !member.openId) {
                return wx.showModal({
                    title: '出错啦',
                    content: '网络不给力,请重新扫码',
                    showCancel: false
                });
            }
            let path = '/xxx/xxxxx/pay', //请求下单的接口
                body = {
                    ownerNum: config.ownerNum,
                    customerNum: member.customerNum,
                    shopNum: member.shopNum,
                    machineNum: page.data.machineNum,
                    memberNum: member.memberNum,
                    source: member.source,
                    payWay: 'WX_XCX',
                    businessType: 'QRCODE_TRAD',
                    openId: member.openId,
                    orderAmount: price
                },
                t = page.getToken({
                    body,
                    path
                });
            wx.showLoading();
            wx.request({
                url: `${origin.order}${path}`,
                data: body,
                method: 'POST',
                header: {
                    'content-type': 'application/json',
                    'accessKey': keys.accessKey,
                    'timestamp': t.timestamp,
                    token: t.token
                },
                success: res => {
                    if (res.errMsg === 'request:ok') {
                        let data = res.data;
                        if (data.result === 'success') {
                            let d = data.data;
                            page.wxPay(d)
                        } else {
                            wx.showModal({
                                title: '错误',
                                content: data.error.errorMsg,
                                showCancel: false
                            });
                        }
                    }
                },
                fail: res => {
                    // 接口调用失败的回调函数

                },
                complete: (res) => {

                }
            });

        }

        // 调起微信支付
        page.wxPay = (data) => {
            let bankRequest = data.bankRequest;
            if (!bankRequest || !bankRequest.APPID || !bankRequest.TIMESTAMP || !bankRequest.NONCESTR || !bankRequest.PACKAGE || !bankRequest.PAYSIGN) {
                return wx.showModal({
                    title: '错误',
                    content: '银行返回异常，请重试',
                    showCancel: false
                });
            }
            let TIMESTAM = bankRequest.TIMESTAMP ? bankRequest.TIMESTAMP.substring(0, 10) : 0,
                scancode_time = page.data.scancode_time ? page.data.scancode_time.substring(0, 10) : 0,
                orderNum = data.orderNum,
                price = page.data.price;
            console.log('scancode_timescancode_time', scancode_time)
            if (scancode_time !== 0 && (TIMESTAM - scancode_time) > 100) { //针对微信6.5版本BUG 导致保留缓存上家店铺信息问题，采取提示措施
                wx.showModal({
                    title: '友情提示',
                    content: '您的操作时间过长，请核实店铺是否正确再进行支付',
                    showCancel: true,
                    cancelText: '取消支付',
                    confirmText: '继续支付',
                    success: (res) => {
                        if (res.confirm) {
                            console.log('用户点击确定')
                            requestPayment()
                            userLog(orderNum)
                        } else {
                            wx.hideLoading();
                        }
                    }
                });
                return false;
            }
            requestPayment()

            function requestPayment() {

                wx.requestPayment({
                    timeStamp: bankRequest.TIMESTAMP,
                    nonceStr: bankRequest.NONCESTR,
                    package: bankRequest.PACKAGE,
                    signType: bankRequest.SIGNTYPE || 'MD5',
                    paySign: bankRequest.PAYSIGN,
                    success: res => {
                        // 接口调用成功的回调函数
                        if (res.errMsg === 'requestPayment:ok') {
                            wx.redirectTo({
                                url: `/order/pages/complete/complete?orderNum=${orderNum}&price=${price}`
                            });
                        }
                    },
                    fail: res => {
                        // 接口调用失败的回调函数
                        wx.hideLoading();
                        if (res.errMsg != 'requestPayment:fail cancel') {
                            console.error(res);

                        }
                    },
                    complete: res => {}
                });
            }

            //继续支付用户日志
            function userLog(orderNum) {
                wx.getSystemInfo({
                    success: function(res) {
                        // console.log(res)
                        let errMsg = [].concat(res.model, res.system, res.version).toString();//收集手机系统、微信版本 手机型号信息
                        console.log(errMsg)
                        wx.request({
                            url: `${origin.order}/xxx/exception`, //收集信息接口
                            method: 'POST',
                            data: {
                                orderNum: orderNum,
                                errMsg: errMsg
                            },
                            success: function() {

                            },
                            fail: function() {

                            }
                        })
                    }
                })
            }

        }

    }
}
module.exports.Payment = Payment;