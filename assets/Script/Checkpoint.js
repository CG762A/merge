
cc.Class({
    extends: cc.Component,

    properties: {

        targetLabel: {
            default: null,
            type: cc.Label
        },

        rewardLabel: {
            default: null,
            type: cc.Label
        },

        timeLabel: {
            default: null,
            type: cc.Label
        },


    },

    onLoad: function () {


    },


    start: function () {
        this.game = cc.find("Canvas").getComponent('Game');
        this.ui = cc.find("Canvas/uiLayer").getComponent('UI');
    },


    checkpointClick: function (event, userData) {
        // console.log("checkpointClick Click!");
        // cc.audioMgr.playEffect("btn_click");

        // console.log(userData);

        // cc.audioMgr.playEffect("UI");


        // //1，先播放一个动画，在动画的过程中删除 现存的 游戏地图
        // //2,加载一个新的地图，开始游戏
        // //首先要把主基地数据存起来
        // cc.dataMgr.saveGameData();

        // this.ui.inCheckpointCompatible();
        // //删除主基地
        // //加载关卡内容
        // this.game.clearGame();
        // this.game.loadGame(userData);

        // this.node.active = false;
    },

    onDisable: function () {
        console.log("check point onDisable~~");

        switch (cc.dataMgr.checkpointDatas[this.curCheckpoint - 1].target) {
            case 0:
                window.Notification.off_target("FLOWER_2", this);
                break;

            case 1:
                window.Notification.off_target("FLOWER_3", this);
                break;

            case 2:
                window.Notification.off_target("HEART_1", this);
                break;

            case 3:
                window.Notification.off_target("HEART_2", this);
                break;

            case 4:
                window.Notification.off_target("ALL_FOG_CLEAR", this);
                break;

            default:
                break;
        }

        this.endCheckpoint();
    },

    onEnable: function () {
        console.log("check point onEnable~~");

        this.beginCheckpoint();
        switch (cc.dataMgr.checkpointDatas[this.curCheckpoint - 1].target) {
            case 0:
                window.Notification.on("FLOWER_2", this.successCp, this);
                
                break;

            case 1:
                window.Notification.on("FLOWER_3", this.successCp, this);
             
                break;
            case 2:
                window.Notification.on("HEART_1", this.successCp, this);
            
                break;

            case 3:
                window.Notification.on("HEART_2", this.successCp, this);
              
                break;
            case 4:

                window.Notification.on("ALL_FOG_CLEAR", this.successCp, this);
              
                break;
            default:
                break;
        }

    },

    successCp: function () {
        console.log("过~~~~~~~~~~关！！");
        this.endCheckpoint();
        //胜利弹窗
        cc.find("Canvas/checkPointEndNode").getComponent(cc.Animation).play("checkPointSuccess");
    },

    beginCheckpoint: function () {
        this.targetLabel.string = "目标:" + cc.dataMgr.getDescByTarget(cc.dataMgr.checkpointDatas[this.curCheckpoint - 1].target);
        this.time = parseInt(cc.dataMgr.checkpointDatas[this.curCheckpoint - 1].time);

        this.rewardLabel.string = "奖励:" + cc.dataMgr.checkpointDatas[this.curCheckpoint - 1].first_Reward + "金币";


        this.schedule(this.timeLabelLogic, 1);
    },

    endCheckpoint: function () {
        this.unschedule(this.timeLabelLogic);
        this.timeLabel.string = "";
        this.targetLabel.string = "";
        this.rewardLabel.string = "";
    },

    timeLabelLogic: function () {
        
        this.timeLabel.string = "剩余时间:" + this.revertCountDown();
        this.time--;

        // if(this.time%2 == 0) {
            
        //     cc.find("Canvas/uiLayer").getComponent("UI").goCheckpointList();
        // } else {
        //     cc.find("Canvas/uiLayer").getComponent("UI").nextCheckpoint();
        // }

        if (this.time <= 0) {
            console.log("失败!");
            this.endCheckpoint();
            //失败弹窗
            cc.find("Canvas/checkPointEndNode").getComponent(cc.Animation).play("checkPointFail");
        }
    },



    revertCountDown: function () {

        var secondTime = parseInt(this.time);// 秒
        var minuteTime = 0;// 分
        var hourTime = 0;// 小时
        if (secondTime > 60) {//如果秒数大于60，将秒数转换成整数
            //获取分钟，除以60取整数，得到整数分钟
            minuteTime = parseInt(secondTime / 60);
            //获取秒数，秒数取佘，得到整数秒数
            secondTime = parseInt(secondTime % 60);
            //如果分钟大于60，将分钟转换成小时
            if (minuteTime > 60) {
                //获取小时，获取分钟除以60，得到整数小时
                hourTime = parseInt(minuteTime / 60);
                //获取小时后取佘的分，获取分钟除以60取佘的分
                minuteTime = parseInt(minuteTime % 60);
            }
        }
        var result = "" + parseInt(secondTime) + "秒";

        if (minuteTime > 0) {
            result = "" + parseInt(minuteTime) + "分" + result;
        }
        if (hourTime > 0) {
            result = "" + parseInt(hourTime) + "小时" + result;
        }
        return result;


    },

   


    setCurCheckpoint: function (curCheckpoint) {
        this.curCheckpoint = curCheckpoint;
    },
    closeClick: function () {
        console.log("close click!");
        cc.audioMgr.playEffect("UI");
        this.node.active = false;
    }

    // nestInOver:function() {
    //     console.log("nestInOver");
    //     this.zzz.active = true;
    //     this.node.getComponent(cc.Animation).play('nestzzz');
    // },

    // noDragonAni:function() {
    //     this.zzz.active = false;
    //     this.node.getComponent(cc.Animation).stop('nestzzz');
    // }



});