const
    config = require('../common/config'),
    origin = config.origin,
    keys = config.keys;

let app = getApp(),
    globalData = app.globalData,
    sha1 = require('../common/sha1.js');

//支付组件
import {
    Payment
} from '../components/payment/payment';

//获取店铺信息组件
import {
    AccessStore
} from '../components/accessStore/accessStore';

let formId = ''; // 保存微信formId

Page({
    data: {
        keyboardHidden: false, // 是否隐藏键盘
        payActive: false, // 支付按钮是否开启
        price: null, // 支付金额
        couponActive: {
            num: null,
            coupon: {}
        },
        businessType: 'QRCODE_TRAD',
        member: {},
        machineNum: '',//获取机具号
        scancode_time: ''// 扫码时间
    },
    onLoad(e) {
        let machineNum = e.q ? e.q.split('%2F').pop().split('%3F').shift() : e.machineNum,  //从二维码里获取机具号
            scancode_time = e.scancode_time || '';  //获取扫码时间

        //获取店铺信息组件
        let accessStore = new AccessStore(this);
        accessStore.bindEvents()

        //支付组件
        let payment = new Payment(this);
        payment.bindEvents();

        console.log(JSON.stringify(machineNum))

        if (machineNum != '' && machineNum != null && machineNum != undefined) {
            wx.getSystemInfo({//获取手机系统
                success: res => {
                    let syst = /ios/ig.test(res.system) ? 'IOS' : 'ANDROID';
                    Object.assign(this.data.member, {
                        source: syst
                    })
                }
            });

            //调用获取店铺信息方法
            this.getOpenId(machineNum).then(member => {
                wx.setNavigationBarTitle({ //动态设置页面标题（店铺名字）
                    title: member.shopName
                });

                this.data.member = member;
                this.setData({
                    machineNum: machineNum,
                    scancode_time: scancode_time

                })
            })
        } else {
            wx.showModal({
                title: '出错啦',
                content: '机具异常'
            })
        }

    },

    onShow() {
        // 如果是通过微信顶部入口进入小程序 跳转至首页
        console.log(`scene----${globalData.scene}`)
        if (globalData.scene === 1089)
            wx.reLaunch({
                url: '/pages/index/index'
            });
    },

    pushFormSubmit(e) {
        this.onKeyboard(e)
    },
    // 键盘点击事件
    onKeyboard(e) {
        let key = e.target.dataset.key,
            is_number = /[0-9 | .]/.test(key);
        if (!key) return !1;

        if (is_number) {
            this.numberKey(key);
        } else {
            this[key + 'Key']();
        }
    },

    // submit提交按钮
    submitInfo(e) {
        formId = e.detail.formId;
        // this.paybtnKey();
        this.loadPay();
    },

    // 数字处理
    numberKey(n) {
        let price = this.data.price,
            p = price && String(price),
            float = p && p.indexOf('.'),
            is_float = /\./g.test(p),
            f = p && p.split('.'),
            fl = f && f.shift(),
            fr = f && f.pop(),
            zreo = is_float,
            h = p + n,
            voucher = this.voucher;

        if (+(p + n) > 50000) {
            return !1;
        } else if (!p) {
            p = n === '.' ? 0 + n : n === '0' ? n + '.' : n;
            this.setData({
                price: p,
                payActive: +p && !0
            });
        } else if ((!is_float && n == '.') || (!is_float && fl.length < 5) || (is_float && n != '.' && (!fr || fr && fr.length < 2))) {
            p = +h < 1 ? h.replace(/^[0]+/, '0') : h.replace(/^0+/, '')
            this.setData({
                price: p,
                payActive: +p && !0
            });
        }
    },

    // 退格键事件
    backKey() {
        let data = this.data,
            price = data.price && String(data.price),
            couponActive = data.couponActive;
        if (!price) return !1;

        price = price.substring(0, price.length - 1);
        this.setData({
            price: price,
            payActive: +price && !0,
            price: price || null
        });
    },
    // 隐藏键盘
    hideKey() {
        this.onKeyboardDispaly();
    },

    // 显示/隐藏键盘操作事件
    onKeyboardDispaly(e) {
        var dispaly = e && e.currentTarget.dataset.display;
        this.setData({
            keyboardHidden: !dispaly
        })
    },

    // 设置开始按钮开启状态
    setPayActive(o = false) {
        this.setData({
            payActive: o
        });
    },

    //生成token
    getToken(opts) {
        let timestamp = new Date().getTime(),
            body = typeof opts.body == 'object' ? JSON.stringify(opts.body) : opts.body;
        let secretKey = opts.type === 'openApi' ? config.openApiSecretKey : keys.secretKey,
            mode = `secretKey=${keys.secretKey}&timestamp=${timestamp}&path=${opts.path}&body=${body}`;
        if (opts.type === 'openApi') {

        }
        return {
            token: sha1.hex_sha1(mode),
            timestamp
        }
    }
})