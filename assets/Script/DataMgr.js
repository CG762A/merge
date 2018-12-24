/**
 * map数据结构定义，用灵活的数据结构目前我还很难想到，至少需要3天。
 * 项目周期非常的短，准备使用简单粗暴的数据结构，能想到的就是在界面里
 * 的map下放入一个矩形区域的地图块，这个块中若是有空隙就很难办，将来
 * 如果有这个需求，打算将那些不要的快的active置为false，那么数据结构
 * 也要相应的调整，在读取地图的时候将所有数据读取到，根据块的active来
 * 做相应的处理。 块以行排列，一行一行的形式
 */


const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class DataMgr extends cc.Component {

    //是否有地图数据，没有就从界面读取，有就从用户数据读取
    hasTileData = false;
    isHall = true; //要么在大厅，要么在关卡。
    screenW = cc.director.getVisibleSize().width;
    screenH = cc.director.getVisibleSize().height;
    edgeMoveCamera = 70;
    //为了解决所有thingsNode上的z序问题
    //思路：根据tile的加载顺序 给上面的thing zOrder 设置为全局的这个 每次递增
    //可以解决问题
    globalZOrder = 0;
    //一下三个数组 是进 关卡，或者大厅 根据关卡摆放生成的数据结构，只有大厅的数据会退出游戏时，永久存储。关卡只记录进度
    //二维tile数据
    tilesData = [];
    //二维things数据
    thingsData = [];
    //一维 飞龙数据
    dragonsData = [];

    hallTileWidth = 11;
    hallTileHeight = 13;

    checkpointWidth = 0;
    checkpintHeight = 0;
    //为了简单打算写死，不能处理生成的龙超过9个以上 这种情况数学上没证明，
    //但是概率应该是极低的3个相同还会归并
    dragonsOffset = [
        {
            xOffset: 0,
            yOffset: 0,
        },
        {
            xOffset: 0,
            yOffset: 100,
        },

        {
            xOffset: -100,
            yOffset: 0,
        },

        {
            xOffset: 0,
            yOffset: -100,
        },

        {
            xOffset: 100,
            yOffset: 0,
        },

        {
            xOffset: -100,
            yOffset: 100,
        },

        {
            xOffset: 100,
            yOffset: 100,
        },

        {
            xOffset: 100,
            yOffset: -100,
        },
        {
            xOffset: -100,
            yOffset: 100,
        },
        {
            xOffset: -100,
            yOffset: -100,
        }
    ];
    //采集数据 花级别 最低龙级别 采集的结果 采集所需时间
    collectionDatas = [
        {
            "flowerLevel": 2,
            "minDragonLevel": 1,
            "heartLevel": 0,
            "needTime": 1
        },

        {
            "flowerLevel": 3,
            "minDragonLevel": 2,
            "heartLevel": 1,
            "needTime": 5
        },

        {
            "flowerLevel": 4,
            "minDragonLevel": 3,
            "heartLevel": 2,
            "needTime": 5
        },

        {
            "flowerLevel": 5,
            "minDragonLevel": 4,
            "heartLevel": 3,
            "needTime": 5
        }
    ];
    //每级龙的初始体力值
    dragonStrengthDatas = [
        {
            "dragonLevel": 1,
            "dragonStrength": 5
        },
        {
            "dragonLevel": 2,
            "dragonStrength": 5
        },
        {
            "dragonLevel": 3,
            "dragonStrength": 1
        },
        {
            "dragonLevel": 4,
            "dragonStrength": 5
        }
    ];
    //每级心的力量
    heartPowerDatas = [
        {
            "heartLevel": 0,
            "heartStrength": 1
        },
        {
            "heartLevel": 1,
            "heartStrength": 4
        },
        {
            "heartLevel": 2,
            "heartStrength": 13
        },
        {
            "heartLevel": 3,
            "heartStrength": 40
        },
        {
            "heartLevel": 4,
            "heartStrength": 121
        }
    ];

    heartDescDatas = [
        {
            "heartLevel": 0,
            "name": "生命精华",
            "levelDesc": "级别0",
            "desc": "点击收集，可用于治疗死地。治疗之力：" + this.heartPowerDatas[0].heartStrength
        },

        {
            "heartLevel": 1,
            "name": "微型生命之球",
            "levelDesc": "级别1",
            "desc": "点击收集，可用于治疗死地。治疗之力：" + this.heartPowerDatas[1].heartStrength
        },

        {
            "heartLevel": 2,
            "name": "小生命之球",
            "levelDesc": "级别2",
            "desc": "点击收集，可用于治疗死地。治疗之力：" + this.heartPowerDatas[2].heartStrength
        },

        {
            "heartLevel": 3,
            "name": "生命之球",
            "levelDesc": "级别3",
            "desc": "点击收集，可用于治疗死地。治疗之力：" + this.heartPowerDatas[3].heartStrength
        },

        {
            "heartLevel": 4,
            "name": "强力生命之球",
            "levelDesc": "级别4",
            "desc": "点击收集，可用于治疗死地。治疗之力：" + this.heartPowerDatas[4].heartStrength
        },
    ];

    flowerDescDatas = [
        {
            "flowerLevel": 1,
            "name": "生命之花幼芽",
            "levelDesc": "级别1",
            "desc": "合并以生成一朵“生命之花”"
        },

        {
            "flowerLevel": 2,
            "name": "生命之花",
            "levelDesc": "级别2",
            "desc": "采集以获取“生命精华”(将巨龙放置到它上面进行采集)"
        },

        {
            "flowerLevel": 3,
            "name": "蓝色生命之花",
            "levelDesc": "级别3",
            "desc": "采集以获取“微型生命之球”"
        },

        {
            "flowerLevel": 4,
            "name": "发光的生命之花",
            "levelDesc": "级别4",
            "desc": "采集以获取“小型生命之球”"
        },

        {
            "flowerLevel": 5,
            "name": "双生生命之花",
            "levelDesc": "级别5",
            "desc": "采集以获取“生命之球”"
        },
    ];

    //龙和蛋描述，
    //龙的特殊性：点龙的时候要描述出->龙的剩余体力，不能用这套系统了
    dragonDescDatas = [
        {
            "dragonLevel": 0,
            "name": "深红龙蛋",
            "levelDesc": "级别0",
            "desc": "合并3个来孵化一头龙"
        },

        {
            "dragonLevel": 1,
            "name": "深红龙幼崽",
            "levelDesc": "级别1",
            "desc": "总体力：" + this.dragonStrengthDatas[0].dragonStrength
        },

        {
            "dragonLevel": 2,
            "name": "年幼的深红龙",
            "levelDesc": "级别2",
            "desc": "总体力：" + this.dragonStrengthDatas[1].dragonStrength
        },

        {
            "dragonLevel": 3,
            "name": "深红龙",
            "levelDesc": "级别3",
            "desc": "总体力：" + this.dragonStrengthDatas[2].dragonStrength
        },

        {
            "dragonLevel": 4,
            "name": "贵族深红龙",
            "levelDesc": "级别4",
            "desc": "总体力：" + this.dragonStrengthDatas[3].dragonStrength
        }

    ];

    //宝箱概率数据 这里的概率为了方便算法执行，进行的是 介于 上一个概率值 和当前概率值之间的数，就表示随到了
    treasureChestDatas = [
        //为了算法简便，前置一个
        {
            "probability": 0.0
        },

        {
            "category": "coin",
            "count": 1,
            "probability": 0.0
        },

        {
            "category": "flower",
            "level": 1,
            "probability": 0.3
        },

        {
            "category": "dragon",
            "level": 0,
            "probability": 0.5
        },

        {
            "category": "heart",
            "level": 0,
            "probability": 1.0
        }
    ];


    //duration 单位：秒
    dragonNestDuration = [
        {
            "dragonLevel": 1,
            "duration": 4,
        },

        {
            "dragonLevel": 2,
            "duration": 4
        },

        {
            "dragonLevel": 3,
            "duration": 4
        },

        {
            "dragonLevel": 4,
            "duration": 4
        },
    ];


    //龙巢里的龙 将来要持久化 数据结构 只需插入 醒来时间 和 进入级别
    /**
     * {
     *     "level" : 1/2/3/4/..  龙的级别
     *     "wakeUpTime" : 5213213123//单位秒 1972年到现在的秒数、
     * }
     */
    dragonNestDatas = [];
    //数据持久化 解码后的 各个tile数据
    hallTileData = null;
    init() {
        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("datamgr  hide");
            cc.dataMgr.saveGameData();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("datamgr  show");

        });



        //用于购买宝箱 金币
        var coinCount = cc.sys.localStorage.getItem("coinCount");
        if (!coinCount) {
            cc.sys.localStorage.setItem("coinCount", 0);
        }
        //用于邀请好友的奖励？需求不定，钻石
        var diamondCount = cc.sys.localStorage.getItem("diamondCount");
        if (!diamondCount) {
            cc.sys.localStorage.setItem("diamondCount", 0);
        }

        //用于解锁雾 收集的心的数量 会把各级心换算对应的一级心个数
        var heartCount = cc.sys.localStorage.getItem("heartCount");
        if (!heartCount) {
            cc.sys.localStorage.setItem("heartCount", 0);
        }


        var strHallTileData = cc.sys.localStorage.getItem("hallTileData");
        var strDragonData = cc.sys.localStorage.getItem("dragonDatas");
        if (!strHallTileData) {
            this.hallTileData = null;
        } else {
            //块上数据
            this.hallTileData = JSON.parse(strHallTileData);
            //龙层数据
            this.dragonDatas = JSON.parse(strDragonData);
            //龙巢数据

            console.log(this.dragonDatas);
        }
    };


    randomTreasure() {
        var p = Math.random();
        for (var i = 1; i < this.treasureChestDatas.length; i++) {
            if (p >= this.treasureChestDatas[i - 1].probability && p < this.treasureChestDatas[i].probability) {
                //debugger;
                return this.treasureChestDatas[i];
            }
        }
    };

    getDragonNestDurationByLevel(level) {
        for (var i = 0; i < this.dragonNestDuration.length; i++) {
            if (this.dragonNestDuration[i].dragonLevel == level) {
                return this.dragonNestDuration[i].duration;
            }
        }
    };

    //将最早放入队列的龙取出来
    dequeueDragonNest() {
        return this.dragonNestDatas.shift();
    };

    //龙巢是否有龙
    isHaveDragon() {
        if (this.dragonNestDatas.length > 0) {
            return true;
        }

        return false;
    };

    pushDragonToNest(time, level) {
        var wakeUpTime;
        //若有龙 以最后一条龙的结束时间为开始
        if (this.isHaveDragon()) {
            var len = this.dragonNestDatas.length;
            wakeUpTime = this.dragonNestDatas[len - 1].wakeUpTime + this.getDragonNestDurationByLevel(level);
        } else {
            wakeUpTime = time / 1000 + this.getDragonNestDurationByLevel(level);
        }

        this.dragonNestDatas.push({ "level": level, "wakeUpTime": wakeUpTime });
    };

    getCurrentDragonCountDown() {
        var wut = this.dragonNestDatas[0].wakeUpTime;
        var ct = Date.now() / 1000;

        return wut - ct;
    };

    getDescByTypeAndLevel(type, level) {
        //精华
        if (type == 1) {
            for (var i = 0; i < this.heartDescDatas.length; i++) {
                if (this.heartDescDatas[i].heartLevel == level) {
                    return this.heartDescDatas[i];
                }
            }
        }
        //花
        else if (type == 2) {
            for (var i = 0; i < this.flowerDescDatas.length; i++) {
                if (this.flowerDescDatas[i].flowerLevel == level) {
                    return this.flowerDescDatas[i];
                }
            }
        }
        //龙蛋和龙
        else if (type == 3) {
            for (var i = 0; i < this.dragonDescDatas.length; i++) {
                if (this.dragonDescDatas[i].dragonLevel == level) {
                    return this.dragonDescDatas[i];
                }
            }
        }


    };

    getHeartCount() {
        var heartCount = cc.sys.localStorage.getItem("heartCount");

        return parseInt(heartCount);
    };

    addHeartCount(count) {
        var result = this.getHeartCount() + count;
        cc.sys.localStorage.setItem("heartCount", result);
    };

    getCoinCount() {
        var coinCount = cc.sys.localStorage.getItem("coinCount");
        return parseInt(coinCount);
    };

    addCoinCount(count) {
        var result = this.getCoinCount() + count;
        cc.sys.localStorage.setItem("coinCount", result);
    };

    getDiamondCount() {
        var diamondCount = cc.sys.localStorage.getItem("diamondCount");
        return parseInt(diamondCount);
    };

    addDiamondCount(count) {
        var result = this.getDiamondCount() + count;
        cc.sys.localStorage.setItem("diamondCount", result);
    };

    getHeartCountByLevel(heartLevel) {
        for (var i = 0; i < this.heartPowerDatas.length; i++) {
            if (this.heartPowerDatas[i].heartLevel == heartLevel) {
                return parseInt(this.heartPowerDatas[i].heartStrength);
            }
        }
        debugger;
    };

    getCurrentWidthAndHeight() {
        if (this.isHall) {
            return {
                w: this.hallTileWidth,
                h: this.hallTileHeight
            };
        } else {
            return {
                w: this.checkpointWidth,
                h: this.checkpintHeight
            };
        }
    };

    //checkpointID 大厅是0 关卡的从1开始类推 mapNode的tile必须按照从左到右，从上到下的顺序摆放
    initTile(checkpointID, tiles) {
        //console.log(tiles);
        for (var i = 0; i < this.hallTileHeight; i++) {
            this.tilesData[i] = [];
        }
        for (var i = 0; i < this.hallTileHeight; i++) {
            for (var j = 0; j < this.hallTileWidth; j++) {
                this.tilesData[i][j] = tiles[i * this.hallTileWidth + j];
                this.tilesData[i][j].getComponent('Tile').setIndex(j, i);
            }
        }
        // console.log(this.tilesData);
    };


    getDragonStrength(dragonLevel) {
        for (var i = 0; i < this.dragonStrengthDatas.length; i++) {
            if (this.dragonStrengthDatas[i].dragonLevel == dragonLevel) {
                return this.dragonStrengthDatas[i].dragonStrength;
            }
        }
        //不可能执行到这里
        debugger;
    };

    //根据花的级别 从dataMgr中找到最小的龙级别
    getCollectionMinDragonLevel(flowerLevel) {
        // this.collectionDatas = [
        //     {
        //         "flowerLevel": 1,
        //         "minDragonLevel": 1,
        //         "heartLevel": 0,
        //         "needTime": 5
        //     },

        for (var i = 0; i < this.collectionDatas.length; i++) {
            if (this.collectionDatas[i].flowerLevel == flowerLevel) {
                return this.collectionDatas[i].minDragonLevel;
            }
        }

        //给的花级别 表中没有，目前说明：花的级别很低，不支持采集
        return null;

    };

    getNeedTimeByFlowerLevel(flowerLevel) {
        for (var i = 0; i < this.collectionDatas.length; i++) {
            if (this.collectionDatas[i].flowerLevel == flowerLevel) {
                return this.collectionDatas[i].needTime;
            }
        }
    };

    getCollectionHeartLevel(flowerLevel) {
        for (var i = 0; i < this.collectionDatas.length; i++) {
            if (this.collectionDatas[i].flowerLevel == flowerLevel) {
                return this.collectionDatas[i].heartLevel;
            }
        }

        //传入的可收集的花 竟然没有找到返回的精华类别？
        debugger;
    };


    //数据持久化，游戏内货币不用处理，已经做好了，这里要做的是
    /**
     * 1: tile层持久化， 每个tile上面是什么东西？
     * tileType: 0绿地 1雾
     * fogAmount：雾需要多少精华解锁
     * fogState：雾的游戏状态 0代表是雾，1代表雾已经解锁了，是宝箱
     *thingType： 0=没有，1=精华，2=花，3=龙蛋
     * thingLevel：物品的级别
     * dontWant：0默认要这个块，除非特殊需求，这个块不要了，置为1，功能好像没做
     * 2:龙层持久化，把龙层的所有龙持久化
     * 1：thingType 类型 冗余数据 但是打算存起来，永远都是3
     * 2：thingLevel 龙级别
     * 3：strength 龙剩余体力
     * 4: position cc.v2 龙的坐标，也储存把，不然加载后，这些龙我不知道放在什么地方
     */
    saveGameData() {
        var tilePersistenceDatas = [];
        for (var i = 0; i < this.hallTileHeight; i++) {
            for (var j = 0; j < this.hallTileWidth; j++) {

                var tileData = {};
                var tileJS = this.tilesData[i][j].getComponent('Tile');
                tileData.tileType = tileJS.tileType;
                tileData.fogAmount = tileJS.fogAmount;
                tileData.fogState = tileJS.fogState;
                tileData.thingType = tileJS.thingType;
                tileData.thingLevel = tileJS.thingLevel;
                tileData.dontWant = tileJS.dontWant;
                tilePersistenceDatas.push(tileData);
            }
        }

        cc.sys.localStorage.setItem("hallTileData", JSON.stringify(tilePersistenceDatas));


        var dragonPersistenceDatas = [];

        //作为数据层，去持有界面的数据 写法很不好，目前没有太好的办法
        var dragonsNode = cc.find("Canvas/gameLayer/dragonsNode");
        var dragons = dragonsNode.children;
        for (var i = 0; i < dragons.length; i++) {
            var dragonData = {};
            var dragonJS = dragons[i].getComponent('Dragon');
            dragonData.thingType = dragonJS.thingType;
            dragonData.thingLevel = dragonJS.thingLevel;
            dragonData.strength = dragonJS.strength;
            dragonData.position = dragons[i].position;
            dragonPersistenceDatas.push(dragonData);
        }

        cc.sys.localStorage.setItem("dragonDatas",JSON.stringify(dragonPersistenceDatas));
    };

    //打印tile的数据 debug用
    debugTileInfo() {
        for (var i = 0; i < this.hallTileHeight; i++) {
            for (var j = 0; j < this.hallTileWidth; j++) {


                //console.log(this.tilesData[i][j].getComponent('Tile').thingType + "  " + this.tilesData[i][j].getComponent('Tile').thingLevel);
                console.log(this.tilesData[i][j].getComponent('Tile'));
            }
        }
    };

}

