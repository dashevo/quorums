const rs = require('randomstring')

module.exports = {
    getMnList: function() {

        let basePort = 3000;
        let dapiCount = 10;
        let arr = [];
        let localIp = require("ip").address();

        for (let i = 0; i < dapiCount; i++) {
            arr.push({
                "vin": `2fb6c98b37f1fce1c35b556e5f175dd77939f08c1687ad468d37fc677d297dd6-${i}`,
                "status": "ENABLED",
                "rank": rs.generate({ length: 3, charset: 'numeric' }),
                "ip": `${localIp}:${basePort + i}`,
                "protocol": 70208,
                "payee": `y${rs.generate({ length: 34, charset: 'hex' })}`,
                "activeseconds": 384154,
                "lastseen": 1508750134
            })
        }

        return arr;
    }
} 