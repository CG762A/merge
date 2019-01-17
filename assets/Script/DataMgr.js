/**
 * map数据结构定义，用灵活的数据结构目前我还很难想到，至少需要3天。
 * 项目周期非常的短，准备使用简单粗暴的数据结构，能想到的就是在界面里
 * 的map下放入一个矩形区域的地图块，这个块中若是有空隙就很难办，将来
 * 如果有这个需求，打算将那些不要的块的active置为false，那么数据结构
 * 也要相应的调整，在读取地图的时候将所有数据读取到，根据块的active来
 * 做相应的处理。 块以行排列，一行一行的形式
 */


const {
    ccclass,
    property
} = cc._decorator;
@ccclass
export default class DataMgr extends cc.Component {
    //以年月日 时分 来标记版本，目前只用于清空数据
    version = "2019-01-11-1456";

    //是否播放音效和背景音乐
    playEffect = true;
    playBg = true;

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

    hallTileWidth = 15;
    hallTileHeight = 20;

    //各个关卡宽高
    checkpointsWAndH = [
        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },

        {
            "w": 5,
            "h": 7
        },
    ]

    //用于规范摄像机区域的值  他不是对称的
    hallLeftWidth = 2800;
    hallRightWidth = 6400;
    hallUpHeight = 3400;
    hallDownHeight = 2500;

    checkpointWidth = 0;
    checkpintHeight = 0;

    toturialTotalStep = 5;
    //放入持久化存储了
    // toturialCurStep = 0; //当前第几步 从0开始  toturialCurStep<toturialTotalStep 则进入新手教学， 否则结束
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
            "needTime": 8
        },

        {
            "flowerLevel": 3,
            "minDragonLevel": 1,
            "heartLevel": 0,
            "needTime": 4
        },

        {
            "flowerLevel": 4,
            "minDragonLevel": 1,
            "heartLevel": 1,
            "needTime": 8
        },

        {
            "flowerLevel": 5,
            "minDragonLevel": 1,
            "heartLevel": 1,
            "needTime": 4
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
            "dragonStrength": 20
        },
        {
            "dragonLevel": 3,
            "dragonStrength": 80
        },
        {
            "dragonLevel": 4,
            "dragonStrength": 320
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
            "heartStrength": 16
        },
        {
            "heartLevel": 3,
            "heartStrength": 64
        },
        {
            "heartLevel": 4,
            "heartStrength": 256
        }
    ];

    //商城 物品 价格表
    shopDatas = [
        //宝箱
        {

            "name": "treasureChest",
            "price": 1
        },
        //龙蛋
        {
            "name": "dragonEgg",
            "price": 5
        },


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
            "flowerLevel": 0,
            "name": "蒲公英",
            "levelDesc": "级别0",
            "desc": "合并生成生命之花幼芽"
        },

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
            "probability": 0.2
        },

        {
            "category": "flower",
            "level": 1,
            "probability": 0.9

        },

        {
            "category": "dragon",
            "level": 0,
            "probability": 1.0
        },

        // {
        //     "category": "heart",
        //     "level": 0,
        //     "probability": 1.0
        // }
    ];

    //转盘内容 以及各项概率
    //注：这里可以定义转盘内容的各种概率以及奖励物品是什么，实现保证图片资源的替换
    //限制：界面与这里的数据项数量必须一样
    rouletteDatas = [
        //为了算法简便，前置一个
        {
            "probability": 0.0
        },

        {
            "reward": "treasureChest",
            "level": 0,
            "probability": 0.3,
            "count": 1,
            //随到物品后，不知道物品在数组的索引，就无从计算最终的角度，为了提高性能，数据直接放入内部，不要修改！！
            "index": 0
        },

        {
            "reward": "flower",
            "level": 3,
            "probability": 0.6,
            "count": 1,
            "index": 1
        },

        {
            "reward": "draggon",
            "level": 2,
            "probability": 0.65,
            "count": 1,
            "index": 2
        },

        {
            "reward": "coin",
            "level": 0,
            "probability": 0.8,
            "count": 1,
            "index": 3
        },

        {
            "reward": "draggon",
            "level": 3,
            "probability": 0.81,
            "count": 1,
            "index": 4
        },

        {
            "reward": "heart",
            "level": 3,
            "probability": 1.0,
            "count": 1,
            "index": 5
        }
    ];


    //duration 单位：秒 休息时间
    dragonNestDuration = [
        {
            "dragonLevel": 1,
            "duration": 60,
        },

        {
            "dragonLevel": 2,
            "duration": 80
        },

        {
            "dragonLevel": 3,
            "duration": 95
        },

        {
            "dragonLevel": 4,
            "duration": 150
        },
    ];

    //每日登陆数据表配置 支持数据改变界面的图片
    //reward: 花:flower 心：heart 金币：coin 龙：draggon（蛋是级别0） 宝箱：treasureChest
    /**
     * //宝箱没有级别概念，无用数据 仅支持0
     * //初级花是1 蒲公英是0
     *  "count":1,//金币才有用，不打算实现除金币外多个情况，因为除了金币都要摆放。。提供接口防止未来需要加入多个
     * //0是最初级的心
     * //数据冗余，金币没有级别概念,目前仅支持0//支持多个
     */
    signInRewardData = [
        {
            "dayCount": 1,
            "reward": "treasureChest",
            "level": 0,
            "count": 1,
        },

        {
            "dayCount": 2,
            "reward": "coin",
            "level": 0,
            "count": 1,
        },

        {
            "dayCount": 3,
            "reward": "flower",
            "level": 3,
            "count": 1,
        },

        {
            "dayCount": 4,
            "reward": "flower",
            "level": 4,
            "count": 1,
        },

        {
            "dayCount": 5,
            "reward": "draggon",
            "level": 0,
            "count": 1,
        },

        {
            "dayCount": 6,
            "reward": "heart",
            "level": 3,
            "count": 1,
        },

        {
            "dayCount": 7,
            "reward": "draggon",
            "level": 1,
            "count": 1,
        },
    ];

    //花合成奖励数据表 只奖励心
    flowerUnionRewardDatas = [
        {
            "level": 2,
            "count": 1
        },

        {
            "level": 3,
            "count": 4
        },

        {
            "level": 4,
            "count": 10
        },

        {
            "level": 5,
            "count": 20
        },

    ];

    /**
     * 自己临时觉得好玩加的，龙在采集时说一些话，提示玩家游戏技巧或者给玩家一些目标暗示
     */
    saySomethingByDragon = [

        "我的家园,不允许有雾霾!",
        "我们龙类也可以合并的!",

        "啊~~新鲜的野花!",
        "一次合并更多的东西,效果更好~",
        "有需要就叫醒我。",
        "我们肯定可以清除所有的雾霾!",
        "我超强力的!"
    ];

    checkpointTargetDatas = [
        {
            "id": 0,
            "desc": "生命之花*1",
        },
        {
            "id": 1,
            "desc": "蓝色生命之花*1",
        },

        {
            "id": 2,
            "desc": "微型生命精华*1",
        },

        {
            "id": 3,
            "desc": "小生命精华*1",
        },

        {
            "id": 4,
            "desc": "解锁所有土地",
        },

    ];

    checkpointDatas = [
        { "id": 1, "time": 600, "target": 0, "first_Reward": 5, "daily_Reward": 1 },
        { "id": 2, "time": 600, "target": 1, "first_Reward": 5, "daily_Reward": 1 },
        { "id": 3, "time": 600, "target": 2, "first_Reward": 5, "daily_Reward": 1 },
        { "id": 4, "time": 600, "target": 2, "first_Reward": 5, "daily_Reward": 1 },
        { "id": 5, "time": 600, "target": 3, "first_Reward": 5, "daily_Reward": 1 },
        { "id": 6, "time": 600, "target": 4, "first_Reward": 5, "daily_Reward": 2 },
        { "id": 7, "time": 180, "target": 4, "first_Reward": 5, "daily_Reward": 2 },
        { "id": 8, "time": 600, "target": 4, "first_Reward": 5, "daily_Reward": 2 },
        { "id": 9, "time": 360, "target": 4, "first_Reward": 5, "daily_Reward": 2 },
        { "id": 10, "time": 600, "target": 4, "first_Reward": 5, "daily_Reward": 2 },
        { "id": 11, "time": 300, "target": 4, "first_Reward": 5, "daily_Reward": 3 },
        { "id": 12, "time": 110, "target": 4, "first_Reward": 5, "daily_Reward": 3 },
        { "id": 13, "time": 80, "target": 4, "first_Reward": 5, "daily_Reward": 3 },
        { "id": 14, "time": 60, "target": 4, "first_Reward": 5, "daily_Reward": 3 },
        { "id": 15, "time": 600, "target": 4, "first_Reward": 5, "daily_Reward": 3 },
        { "id": 16, "time": 600, "target": 4, "first_Reward": 5, "daily_Reward": 4 },
        { "id": 17, "time": 600, "target": 4, "first_Reward": 5, "daily_Reward": 4 },
        { "id": 18, "time": 60, "target": 4, "first_Reward": 5, "daily_Reward": 4 },
        { "id": 19, "time": 60, "target": 4, "first_Reward": 5, "daily_Reward": 4 },
        { "id": 20, "time": 60, "target": 4, "first_Reward": 5, "daily_Reward": 4 },
    ];





    //蒲公英的生成周期 单位：秒
    dandelionPeriod = 4;

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


    ShareState = {
        "SHARE_NONE": 1,//没有分享奖励的分享
        "DRAGON_OUT": 2,//分享直接龙唤醒一条
        "DANDELION_COUNT": 4,//分享后多生产蒲公英
        "ROULETTE_GO": 8,//分享后让轮盘旋转

    };

    shareTitleDatas = [
        {

            title: "我们抬头望天空， 星星还亮着几颗……",
            url: "https://bpw.blyule.com/Merge_Res/share1.jpg",
        },

        {

            title: "外星人信号？不，那是虚空龙族对你的召唤～",
            url: "https://bpw.blyule.com/Merge_Res/share2.jpg",
        },

        {

            title: "集齐了七颗龙蛋，一个让我意想不到的事情发生了……",
            url: "https://bpw.blyule.com/Merge_Res/share3.jpg",
        },

        {

            title: "集齐了七颗龙蛋，一个让我意想不到的事情发生了……",
            url: "https://bpw.blyule.com/Merge_Res/share4.jpg",
        },

        {

            title: "集齐了七颗龙蛋，一个让我意想不到的事情发生了……",
            url: "https://bpw.blyule.com/Merge_Res/share5.jpg",
        }
    ];

    //分享状态：用于标记当前的分享是为了什么，根据这个给奖励
    shareState = this.ShareState.SHARE_NONE;

    init() {
        console.log("看下 shareState");
        console.log(this.shareState);
        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("datamgr  hide");
            if (cc.dataMgr.isHall) {
                cc.dataMgr.saveGameData();
            }

        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("datamgr  show");

        });

        let version = cc.sys.localStorage.getItem("version");

        if (version != this.version) {
            cc.sys.localStorage.setItem("version", this.version);
            this.resetData();

            // //leadStep =0 ,表示是在 新手引导的阶段
            // cc.dataMgr.userData.leadStep = 0;
        }

        //用于购买宝箱 金币
        var coinCount = cc.sys.localStorage.getItem("coinCount");
        if (!coinCount) {
            cc.sys.localStorage.setItem("coinCount", 10);
        }

        var toturialCurStep = cc.sys.localStorage.getItem("toturialCurStep");
        if (!toturialCurStep) {
            cc.sys.localStorage.setItem("toturialCurStep", 0);
        }
        // //用于邀请好友的奖励？需求不定，钻石
        // var diamondCount = cc.sys.localStorage.getItem("diamondCount");
        // if (!diamondCount) {
        //     cc.sys.localStorage.setItem("diamondCount", 0);
        // }

        //每日登陆的进度
        var signInProgress = cc.sys.localStorage.getItem("signInProgress");
        if (!signInProgress) {
            cc.sys.localStorage.setItem("signInProgress", 0);
        }
        //上次签到年月日
        var signInDay = cc.sys.localStorage.getItem("signInDay");
        if (!signInDay) {
            cc.sys.localStorage.setItem("signInDay", "20181128");
        }

        //上次分享的年月日
        var shareDay = cc.sys.localStorage.getItem("shareDay");
        if (!shareDay) {
            cc.sys.localStorage.setItem("shareDay", "20181128");
        }

        //用于解锁雾 收集的心的数量 会把各级心换算对应的一级心个数
        var heartCount = cc.sys.localStorage.getItem("heartCount");
        if (!heartCount) {
            cc.sys.localStorage.setItem("heartCount", 1);
        }


        var curCheckpoint = cc.sys.localStorage.getItem("curCheckpoint");
        if (!curCheckpoint) {
            cc.sys.localStorage.setItem("curCheckpoint", 1);
        }

        this.getHallTileData();
        this.getHallDragonData();



        if (CC_WECHATGAME) {
            wx.onShow(res => {
                console.log("小游戏回到前台");
                console.log(res);
                console.log(cc.dataMgr.shareState);
                if (cc.dataMgr.shareState != cc.dataMgr.ShareState.SHARE_NONE) {
                    var isSuccess = this.shareLogic();

                    window.Notification.emit(cc.dataMgr.shareState, isSuccess);
                    cc.dataMgr.shareState = cc.dataMgr.ShareState.SHARE_NONE;

                }
            });
        }

    };

    //获得用户该玩那一关了
    getCurCheckpoint() {
        var curCheckpoint = cc.sys.localStorage.getItem("curCheckpoint");
        return parseInt(curCheckpoint);
    };

    setCurCheckpoint() {
        
    };

    getDescByTarget(target) {
      
        for(var i = 0; i<this.checkpointTargetDatas.length; i++) {
            if(this.checkpointTargetDatas[i].id == target) {
                return this.checkpointTargetDatas[i].desc;
            }
        }
    };

    getHallTileData() {
        var strHallTileData = cc.sys.localStorage.getItem("hallTileData");

        if (!strHallTileData) {
            this.hallTileData = null;
        } else {
            //块上数据
            this.hallTileData = JSON.parse(strHallTileData);
        }
    };

    getHallDragonData() {
        var strDragonData = cc.sys.localStorage.getItem("dragonDatas");

        if (!strDragonData) {
            this.dragonDatas = null;
        } else {
            //龙层数据
            this.dragonDatas = JSON.parse(strDragonData);
        }

        var strDragonNestDatas = cc.sys.localStorage.getItem("dragonNestDatas");

        if (!strDragonNestDatas) {
            this.dragonNestDatas = [];
        } else {
            //龙巢数据

            this.dragonNestDatas = JSON.parse(strDragonNestDatas);
            // console.log(this.dragonNestDatas);
        }
    };

    share() {
        if (CC_WECHATGAME) {
            var shareData = this.getShareData();

            wx.shareAppMessage({
                title: shareData.title,
                imageUrl: shareData.url
                // imageUrl: str_imageUrl, query: "otherID=" + query_string
            });
        }


        this.beginShareTime = Date.now();
    };

    getShareData() {
        var shareDataIndex = Math.floor(Math.random() * this.shareTitleDatas.length);

        return this.shareTitleDatas[shareDataIndex];
    };


    shareLogic() {
        this.endShareTime = Date.now();

        //小于4秒 分享失败
        if (this.endShareTime - this.beginShareTime < 4000) {
            return false;
        }


        // var curDate = cc.dataMgr.getCurrentDay();
        // var lastDate = cc.dataMgr.getLastShareDay();
        // //今天首次分享 直接分享失败
        // if (curDate != lastDate) {
        //     cc.dataMgr.setLastShareDay(curDate);
        //     return false;
        // }

        // var p = Math.random();
        // //30%概率直接失败
        // if (p < 0.3) {
        //     return false;
        // }

        return true;
    };

    getCurrentDay() {
        var date = new Date();
        return date.getFullYear() + "" + date.getMonth() + date.getDate();
    }

    //先写死每个类型的最高级别。将来即使改也容易
    getMaxLevelByType(type) {
        if (type == 1) {
            return 4;
        } else if (type == 2) {
            return 5;
        } else if (type == 3) {
            return 4;
        } else {
            debugger;
        }
    }

    resetData() {

        cc.sys.localStorage.removeItem("coinCount");
        cc.sys.localStorage.removeItem("heartCount");

        cc.sys.localStorage.removeItem("hallTileData");
        cc.sys.localStorage.removeItem("dragonDatas");
        cc.sys.localStorage.removeItem("dragonNestDatas");

        cc.sys.localStorage.removeItem("signInProgress");
        cc.sys.localStorage.removeItem("signInDay");
        cc.sys.localStorage.removeItem("shareDay");

        cc.sys.localStorage.removeItem("toturialCurStep");
    }

    addToturialStep(count) {
        if (!count) {
            count = 1;
        }
        var cs = this.getToturialCurStep() + count;
        cc.sys.localStorage.setItem("toturialCurStep", cs);
        return cs;
    }

    getToturialCurStep() {
        return parseInt(cc.sys.localStorage.getItem("toturialCurStep"));
    }
    hasToturial() {

        return this.getToturialCurStep() < this.toturialTotalStep;
    }

    getFlowerUnionRewardByLevel(level) {
        for (var i = 0; i < this.flowerUnionRewardDatas.length; i++) {
            if (this.flowerUnionRewardDatas[i].level == level) {
                return this.flowerUnionRewardDatas[i].count;
            }
        }

        return null;
    }

    randomTreasure() {
        var p = Math.random();
        for (var i = 1; i < this.treasureChestDatas.length; i++) {
            if (p >= this.treasureChestDatas[i - 1].probability && p < this.treasureChestDatas[i].probability) {
                //debugger;
                return this.treasureChestDatas[i];
            }
        }
    };

    randomRoulette() {
        var p = Math.random();
        for (var i = 1; i < this.rouletteDatas.length; i++) {
            if (p >= this.rouletteDatas[i - 1].probability && p < this.rouletteDatas[i].probability) {
                //debugger;
                //轮盘随到的物品
                return this.rouletteDatas[i];
            }
        }
    };

    getSignInProgress() {
        var p = cc.sys.localStorage.getItem("signInProgress");
        return parseInt(p);
    };

    addSignInProgress() {
        var p = parseInt(cc.sys.localStorage.getItem("signInProgress"));
        if (p >= 6) {
            p = 0;
        } else {
            p++;
        }
        cc.sys.localStorage.setItem("signInProgress", p);
    };



    getLastShareDay() {
        var t = cc.sys.localStorage.getItem("shareDay");
        return t;
    };

    setLastShareDay(date_str) {
        cc.sys.localStorage.setItem("shareDay", date_str);

    };

    getLastSignInDate() {
        var t = cc.sys.localStorage.getItem("signInDay");
        return t;
    };

    setLastSignInDate(date_str) {
        cc.sys.localStorage.setItem("signInDay", date_str);

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
            wakeUpTime = parseInt(time / 1000) + this.getDragonNestDurationByLevel(level);
        }

        this.dragonNestDatas.push({ "level": level, "wakeUpTime": wakeUpTime });
    };

    getCurrentDragonCountDown() {
        var wut = this.dragonNestDatas[0].wakeUpTime;
        var ct = Date.now() / 1000;

        return wut - ct;
    };

    setCurrentDragonWakeUpTime() {
        this.dragonNestDatas[0].wakeUpTime = 0;
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

    getCurrentWidthAndHeight(checkpointID) {

        if (this.isHall) {
            return {
                w: this.hallTileWidth,
                h: this.hallTileHeight
            };
        } else {
            return this.checkpointsWAndH[checkpointID - 1];
        }
    };

    //checkpointID 大厅是0 关卡的从1开始类推 mapNode的tile必须按照从左到右，从上到下的顺序摆放
    initTile(checkpointID, tiles) {

        var wAndH = this.getCurrentWidthAndHeight(checkpointID);
        var h = wAndH.h;
        var w = wAndH.w;
        for (var i = 0; i < h; i++) {
            this.tilesData[i] = [];
        }
        for (var i = 0; i < h; i++) {
            for (var j = 0; j < w; j++) {
                this.tilesData[i][j] = tiles[i * w + j];
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

        cc.sys.localStorage.setItem("dragonDatas", JSON.stringify(dragonPersistenceDatas));

        //存储龙巢内的龙  数据不用解析了，本来就是纯数据的结构
        cc.sys.localStorage.setItem("dragonNestDatas", JSON.stringify(this.dragonNestDatas));

        this.getHallTileData();
        this.getHallDragonData();
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

