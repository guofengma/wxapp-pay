const
    config = require('../../common/config.js'),
    origin = config.origin,
    keys = config.keys;
let sha1 = require('../../common/sha1.js');
let app = getApp()
class AccessStore {
    constructor(page) {
        this.page = page;
    }
    bindEvents() {
        let page = this.page;
        // 获取openid、店铺信息
        page.getOpenId = (machineNum) => {
            let that = page;
            return new Promise((resolve, reject) => {
                wx.login({
                    success: res => {
                        // 发送 res.code 到后台换取 openId, sessionKey, unionId
                        if (res.code) {
                            let body = {
                                    ownerNum: config.ownerNum,
                                    machineNum: machineNum || '',
                                    appId: app.globalData.APPID,
                                    code: res.code,
                                    encryptedData: '',
                                    iv: ''
                                },
                                path= '/xxx/query', //获取店铺信息接口
                                t = that.getToken({ //为了安全会吧数据发给后台走token校验
                                    body: JSON.stringify(body),
                                    path
                                });
                            wx.request({
                                url: `${origin.order}${path}`,
                                method: 'POST',
                                header: {
                                    'content-type': 'application/json',
                                    'accessKey': keys.accessKey,
                                    'timestamp': t.timestamp,
                                    token: t.token
                                },
                                data: body,
                                success: function(res) {
                                    console.log('query success: ', res);
                                    let result = res.data.result,
                                        _data = res.data.data;
                                    if (result == 'success') {
                                        Object.assign(that.data.member, {
                                            machineNum
                                        }, _data)
                                        resolve(that.data.member);

                                    } else {
                                        console.error('/prepay/query', res);
                                        wx.showModal({
                                            title: '出错啦',
                                            content: _data || 'query调用异常'
                                        })
                                    }
                                },
                                fail: err => console.error(err)
                            });
                        } else {
                            return wx.showModal({
                                title: '错误',
                                content: '获取code异常',
                                showCancel: false
                            });
                        }
                    }
                })
            })

        }
    }
}
module.exports.AccessStore = AccessStore;