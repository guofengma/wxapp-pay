App({
    globalData: {
        APPID: '',//填写自己的appid
        scene: '',//进入小程序的场景值
    },
    onLaunch: function() {
        
    },
    onShow: function(opt) {
        this.globalData.scene = opt.scene; //获取进入小程序的场景值
    },


})