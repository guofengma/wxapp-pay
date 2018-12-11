const KEYS_ALL = { //开发 测试 生产 环境的 一些秘钥配置 这个根据自己业务需求，可有可无主要是安全性
    dev: {
        accessKey: '',
        secretKey: ''
    },
    test: {
        accessKey: '',
        secretKey: ''
    },
    production: {
        accessKey: '',
        secretKey: ''
    }
}

let config = {
    origin: {
        order: 'https://order.xxxx.com' //接口通用前半部分的

    },
    ownerNum: '',// 以下都是处于安全性的一些秘钥 生成token的时候用的  根据自己的业务可以选择去配置
    openApiSecretKey: '',
    keys: KEYS_ALL['dev']    //选择 环境
}

module.exports = config;