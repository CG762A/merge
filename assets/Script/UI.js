

cc.Class({
    extends: cc.Component,

    properties: {
        coinLabel: {
            default: null,
            type: cc.Label
        },
        heartLabel: {
            default: null,
            type: cc.Label
        },
        diamondLabel: {
            default: null,
            type: cc.Label
        },

        collectionThingPrefab: {
            default: null,
            type: cc.Prefab,
        },


        dragonPrefab: {
            default: null,
            type: cc.Prefab,
        },

        nameLevelLabel: {
            default: null,
            type: cc.Label
        },

        nameLevelLabel: {
            default: null,
            type: cc.Label
        },

        descLabel: {
            default: null,
            type: cc.Label
        },

        unDescNode: {
            default: null,
            type: cc.Node
        },
        descNode: {
            default: null,
            type: cc.Node
        },

        dragonNestNode: {
            default: null,
            type: cc.Node
        },

        //图鉴按钮 node 用于控制是否显示 在是否点击物品的情况下
        tujianBtnNode: {
            default: null,
            type: cc.Node
        },

        tujianLayer: {
            default: null,
            type: cc.Node
        },

        tujianFlower: {
            default: null,
            type: cc.Node
        },

        tujianHeart: {
            default: null,
            type: cc.Node
        },

        tujianDragon: {
            default: null,
            type: cc.Node
        },

        dragonCountLabel: {
            default: null,
            type: cc.Label
        },

        countDownLabel: {
            default: null,
            type: cc.Label
        },

        //商城界面
        shopLayer: {
            default: null,
            type: cc.Node
        },

        coinPrefab: {
            default: null,
            type: cc.Prefab
        },

        sigInNode: {
            default: null,
            type: cc.Node
        },

        rouletteNode: {
            default: null,
            type: cc.Node
        },

        dandelionNode: {
            default: null,
            type: cc.Node
        },

        shopIconNode: {
            default: null,
            type: cc.Node
        },

        thingPrefab: {
            default: null,
            type: cc.Prefab
        },

        dragonShare_Node: {
            default: null,
            type: cc.Node
        },

        node_toturial: {
            default: null,
            type: cc.Node
        },

        signInButton: {
            default: null,
            type: cc.Node
        },

        rouletteBtn: {
            default: null,
            type: cc.Node
        },

        dragonHome: {
            default: null,
            type: cc.Button
        },

        checkpointLayer: {
            default: null,
            type: cc.Node
        },

        checkpointNode: {
            default: null,
            type: cc.Node
        },

        hallNode: {
            default: null,
            type: cc.Node
        },

        checkPointTips_Node: {
            default: null,
            type: cc.Node
        }
    },

    // use this for initialization
    onLoad: function () {

        this.refreshUI();
        let self = this;
        this.descNode.active = true;
        this.unDescNode.active = false;

        this.checkPointTips_Node.active = false;
    },

    refreshUI: function () {
        this.coinLabel.string = cc.dataMgr.getCoinCount();
        this.heartLabel.string = cc.dataMgr.getHeartCount();
        if (cc.dataMgr.getCoinCount() < 1) {
            this.shopIconNode.getChildByName("light").getComponent(cc.Animation).play("lightOut");
        } else {
            //一般要这样做：如果这个动画在播放就忽略了，没在播放就播放
            //但是cocos的api注释说的很含糊没有找到怎么用
            this.shopIconNode.getChildByName("light").getComponent(cc.Animation).play("light");
        }
    },

    start: function () {
        this.game = cc.find("Canvas").getComponent('Game');
        if (cc.dataMgr.dragonNestDatas.length > 0) {
            this.dragonNestNode.getComponent('nest').nestInOver();
        }
        this.schedule(this.refreshDragonNestInfo, 1);

        //生成蒲公英
        this.dandelionPeriod = cc.dataMgr.dandelionPeriod;
        this.dandelionTimeLabel = this.dandelionNode.getChildByName('dandeLionLabel').getComponent(cc.Label);
        this.dandelionTimeLabel.node.active = false;
        //this.dandelionTimeLabel.string = this.dandelionPeriod;
        this.dandelionGenBtn = this.dandelionNode.getChildByName('dandelionIcon').getComponent(cc.Button);
        this.dandelionGenBtn.interactable = false;
        this.schedule(this.generateDandelion, 1);

        if (cc.dataMgr.getCoinCount() > 0) {
            this.shopIconNode.getChildByName("light").getComponent(cc.Animation).play("light");
        }

        let self = this;


        window.Notification.on("UIMgr_pop", function (data) {
            //console.log(data.length);
            if (data.length == 0) {
                //console.log("显示大厅");
            } else {

            }
        });

        window.Notification.on("UIMgr_push", function (data) {
            //console.log(data.length);
            if (data.length > 0) {
                //console.log("隐藏大厅");
            } else {

            }
        });

        window.Notification.on("go_Checkpoint", function (data) {
            // console.log("关卡按钮被点击");
            // console.log(data);

            cc.audioMgr.playEffect("UI");

            cc.find("Canvas/loadingNode").getComponent(cc.Animation).play();
            self.curCheckpoint = data.idx;
            self.checkPointTips_Node.getComponent("Checkpoint").setCurCheckpoint(data.idx);
            self.checkPointTips_Node.active = true;
            //1，先播放一个动画，在动画的过程中删除 现存的 游戏地图
            //2,加载一个新的地图，开始游戏
            //首先要把主基地数据存起来
            cc.dataMgr.saveGameData();
           
            self.inCheckpointCompatible();
            //删除主基地
            //加载关卡内容
            self.game.clearGame();
            self.game.loadGame(data.idx);
           
          
        });


        //新手教学系统
        this.toturialSystem();
        var isToturial = cc.dataMgr.hasToturial();
        if (isToturial) {
            window.Notification.on("MERGE_FLOWER", function (parameter) {
                var curStep = cc.dataMgr.getToturialCurStep();
                if (curStep == 0) {
                    console.log("新手教学：步奏0结束!");
                    self.toturialNextStep();
                    //送三个龙蛋用于下一步
                    self.generateThreeEgg();
                }
            });

            window.Notification.on("EGG_TO_DRAGON", function (parameter) {
                var curStep = cc.dataMgr.getToturialCurStep();
                if (curStep == 1) {
                    console.log("新手教学：步奏1结束!");
                    self.toturialNextStep();

                }
            });

            window.Notification.on("COL_SUCCESS", function (parameter) {
                var curStep = cc.dataMgr.getToturialCurStep();
                if (curStep == 2) {
                    console.log("新手教学：步奏2结束!");
                    self.toturialNextStep();
                }
            });


            window.Notification.on("COL_HEART", function (parameter) {
                var curStep = cc.dataMgr.getToturialCurStep();
                if (curStep == 3) {
                    console.log("新手教学：步奏3结束!");
                    self.toturialNextStep();
                }
            });

            window.Notification.on("FOG_OPEN", function (parameter) {
                var curStep = cc.dataMgr.getToturialCurStep();
                if (curStep == 4) {
                    console.log("新手教学：步奏4结束!");
                    //self.toturialNextStep();



                    var curStep_node = self.node_toturial.getChildByName("step" + curStep);
                    curStep_node.getComponent(cc.Animation).play("stepOut");


                    var cs = cc.dataMgr.addToturialStep(1);
                    var nextStep_node = self.node_toturial.getChildByName("step" + cs);
                    nextStep_node.getComponent(cc.Animation).play("stepOver");

                    self.toturialSystem();
                }
            });

        } else {
            this.node_toturial.active = false;
        }


        //过审相关的：分享开关
        this.shareForCensorship();
    },


    shareForCensorship: function () {
        if (CC_WECHATGAME) {
            this.rouletteBtn.active = false;
            this.dragonHome.interactable = false;
            wx.request({
                url: 'https://bpw.blyule.com/Merge_Res/mergeSetting.json',

                success: (obj, statusCode, header) => {
                    console.log("是否显示分享的数据");
                    console.log(obj);
                    console.log(obj.data);
                    if (obj.data.showShare) {
                        console.log("显示分享");
                        this.rouletteBtn.active = true;
                        this.dragonHome.interactable = true;

                    } else {
                        console.log("不显示分享");
                        this.rouletteBtn.active = false;
                        this.dragonHome.interactable = false;
                    }

                    // if (obj.data.showMoreGame) {
                    //     console.log("显示更多游戏");

                    //     self.moreGameNode.active = true;
                    // }
                }
            });
        }
    },

    generateThreeEgg: function () {
        for (var i = 0; i < 3; i++) {
            var tile = this.game.getTile();
            this.game.generateAndPutThing_signIn(tile, "draggon", 0);
        }
    },
    //新手教学系统
    toturialSystem: function () {
        //逻辑分析：先查询是否进入新手教学 当前步小于总步数 则进入

        var isToturial = cc.dataMgr.hasToturial();
        if (isToturial) {
            this.node_toturial.active = true;

            var curStep = cc.dataMgr.getToturialCurStep();
            var curStep_node = this.node_toturial.getChildByName("step" + curStep);
            curStep_node.getComponent(cc.Animation).play("stepIn");

            this.closeUIForToturial();
        }
        //若不进入 则 4个系统按钮显示
        else {
            //this.node_toturial.active =false;

            this.openUIForToturial();

            this.shareForCensorship();
        }
    },


    closeUIForToturial: function () {
        this.shopIconNode.active = false;
        this.dandelionNode.active = false;
        this.signInButton.active = false;
        this.rouletteBtn.active = false;

        this.hallNode.active = false;
        this.checkpointNode.active = false;
    },

    openUIForToturial: function () {
        this.shopIconNode.active = true;
        this.dandelionNode.active = true;
        this.signInButton.active = true;
        this.rouletteBtn.active = true;

        this.hallNode.active = false;
        this.checkpointNode.active = true;
    },

    toturialNextStep: function () {
        var curStep = cc.dataMgr.getToturialCurStep();
        var curStep_node = this.node_toturial.getChildByName("step" + curStep);
        curStep_node.getComponent(cc.Animation).play("stepOut");


        var cs = cc.dataMgr.addToturialStep(1);
        var nextStep_node = this.node_toturial.getChildByName("step" + cs);
        nextStep_node.getComponent(cc.Animation).play("stepIn");
    },



    // closeAllToturialTips: function () {
    //     var nodes = this.node_toturial.children;
    //     for (var i = 0; i < nodes.length; i++) {
    //         nodes[i].active = false;
    //     }
    // },

    checkpointBtn: function () {
        console.log("checkpointBtn Click~");

        // cc.audioMgr.playEffect("UI");


        // //1，先播放一个动画，在动画的过程中删除 现存的 游戏地图
        // //2,加载一个新的地图，开始游戏
        // //首先要把主基地数据存起来
        // cc.dataMgr.saveGameData();

        // this.inCheckpointCompatible();
        // //删除主基地
        // //加载关卡内容
        // this.game.clearGame();
        // this.game.loadGame(1);

        cc.audioMgr.playEffect("UI");

        // this.checkpointLayer.active = true;
        cc.uiMgr.Push("MapChooseFrame", { index:  cc.dataMgr.getCurCheckpoint() - 1 })

    },

    hallBtn: function () {
        console.log("hallBtn Click~");

        cc.audioMgr.playEffect("UI");
        this.checkPointTips_Node.active = false;
        cc.find("Canvas/loadingNode").getComponent(cc.Animation).play();
        this.outCheckpointCompatible();
        //删除主基地
        //加载关卡内容
        this.game.clearGame();
        this.game.loadGame(null);
    },

    inCheckpointCompatible: function () {
        this.unschedule(this.refreshDragonNestInfo);

        this.dragonHome.node.parent.active = false;
        //先全关
        this.closeUIForToturial();
        this.dandelionNode.active = true;
        this.hallNode.active = true;
    },

    outCheckpointCompatible: function () {
        this.schedule(this.refreshDragonNestInfo, 1);

        this.dragonHome.node.parent.active = true;

        this.openUIForToturial();
    },

    refreshDragonNestInfo: function () {
        //console.log("-----每秒 刷新龙巢");
        var len = cc.dataMgr.dragonNestDatas.length;
        this.dragonCountLabel.string = len;

        if (len < 1) {
            this.countDownLabel.node.active = false;
            this.dragonCountLabel.node.active = false;
            this.dragonNestNode.getComponent('nest').noDragonAni();
        } else {
            this.countDownLabel.node.active = true;
            this.dragonCountLabel.node.active = true;
            var totleSecond = cc.dataMgr.getCurrentDragonCountDown();
            if (totleSecond < 1) {
                console.log("龙出巢逻辑！！todo");
                this.dragonMoveOutNest();
            } else {
                this.setTimeToLabel(totleSecond, this.countDownLabel);
            }


        }
    },

    generateDandelion: function () {
        this.dandelionPeriod--;

        this.dandelionNode.getChildByName("circleMask").getComponent(cc.Sprite).fillRange = this.dandelionPeriod / cc.dataMgr.dandelionPeriod;
        //到时间了 点击可以生成蒲公英
        if (this.dandelionPeriod <= 0) {
            this.dandelionGenBtn.interactable = true;
            this.unschedule(this.generateDandelion);

            this.dandelionNode.getChildByName("light").getComponent(cc.Animation).play("light");
            console.log("赶快收集吧");
        } else {
            //this.dandelionTimeLabel.string = this.dandelionPeriod;
        }
    },

    //生成蒲公英
    dandelionGenerateClick: function () {
        cc.audioMgr.playEffect("btn_click");

        var thingsNode = cc.find("Canvas/gameLayer/thingsNode");
        var camerapos = this.dandelionNode.parent.convertToWorldSpaceAR(this.dandelionNode.position);

        //var worldpos = cc.v2(camerapos.x + this.game.camera.position.x, camerapos.y + this.game.camera.position.y);

        var worldpos = this.game.camera.getComponent(cc.Camera).getCameraToWorldPoint(camerapos);
        var nodepos = thingsNode.convertToNodeSpaceAR(worldpos);

        var tile = this.game.getTile(nodepos);
        if (tile) {
            this.dandelionNode.getChildByName("light").getComponent(cc.Animation).play("lightOut");
            this.dandelionGenBtn.interactable = false;
            this.dandelionPeriod = cc.dataMgr.dandelionPeriod;
            this.schedule(this.generateDandelion, 1);

            var dandelion = cc.instantiate(this.thingPrefab);
            dandelion.getChildByName('selectedNode').getComponent('Thing').setTypeAndLevel_forNewThing(2, 0);


            thingsNode.addChild(dandelion);



            dandelion.position = nodepos;


            var thingJs = dandelion.getChildByName('selectedNode').getComponent('Thing');
            thingJs.changeInTile(tile, 0, 2);
        } else {
            console.log("没有空格，无法收集蒲公英");
        }

    },

    dragonMoveOutNest: function () {
        var outDragonData = cc.dataMgr.dequeueDragonNest();
        console.log(outDragonData);



        var dragonNode = cc.instantiate(this.dragonPrefab);
        dragonNode.getComponent('Dragon').setTypeAndLevel_forNewDragon(3, outDragonData.level);
        var dragonsNode = cc.find("Canvas/gameLayer/dragonsNode");
        dragonsNode.addChild(dragonNode);
        var camerapos = this.dragonNestNode.parent.convertToWorldSpaceAR(this.dragonNestNode.position);
        //debugger;
        //var worldpos = cc.v2(camerapos.x + this.game.camera.position.x, camerapos.y + this.game.camera.position.y);


        var worldpos = this.game.camera.getComponent(cc.Camera).getCameraToWorldPoint(camerapos);
        var nodepos = dragonsNode.convertToNodeSpaceAR(worldpos);
        dragonNode.position = nodepos;

        dragonNode.scale = 0.0;




        var targetPos = cc.v2(360, 640);
        var targetWorldpos = cc.v2(targetPos.x + this.game.camera.position.x, targetPos.y + this.game.camera.position.y);
        var targetNodepos = dragonsNode.convertToNodeSpaceAR(targetWorldpos);
        var action = cc.moveTo(2.0, targetNodepos);
        var action2 = cc.scaleTo(2.0, 1);
        var together = cc.spawn(action, action2);
        var seq = cc.sequence(together, cc.callFunc(this.dragonMoveOutNestOver, this, dragonNode));
        dragonNode.runAction(seq);

    },

    dragonMoveOutNestOver: function (dragonNode) {

        // dragonNode.removeFromParent(false);
        // var dragonsNode = cc.find("Canvas/gameLayer/dragonsNode");
        // var pos =  dragonsNode.convertToNodeSpaceAR(dragonNode.position);
        // dragonsNode.addChild(dragonNode);
        // dragonNode.position = pos;
    },

    setTimeToLabel: function (dx, label) {
        if (dx < 0) { //负的
            label.string = "";
            return;
        }
        //dx-->29分54秒
        let m = parseInt(dx / 60);
        let s = parseInt(dx - (60 * m));

        // label.string = m + "分" + s + "秒";
        label.string = m + ":" + s;
    },

    //图鉴按钮被点击
    tujianClick: function () {
        console.log("图鉴按钮点击了！");
        cc.audioMgr.playEffect("UI");
        this.tujianLayer.active = true;
        if (this.thingType == 1) {
            this.tujianHeart.active = true;

            this.tujianDragon.active = false;
            this.tujianFlower.active = false;
        } else if (this.thingType == 2) {
            this.tujianFlower.active = true;

            this.tujianDragon.active = false;
            this.tujianHeart.active = false;
        } else if (this.thingType == 3) {
            this.tujianDragon.active = true;

            this.tujianHeart.active = false;
            this.tujianFlower.active = false;
        } else {
            debugger;
        }
    },

    tujianCloseClick: function () {
        cc.audioMgr.playEffect("UI");
        this.tujianLayer.active = false;
    },

    shopLayerClick: function () {
        cc.audioMgr.playEffect("UI");
        this.shopLayer.active = true;
    },

    addHeartAndAni: function (camerapos, level) {
        // var worldpos =  this.game.camera.getComponent(cc.Camera).getCameraToWorldPoint(camerapos);
        // var nodepos = this.node.convertToNodeSpaceAR(camerapos);
        //var nodepos =cc.pSub(camerapos,cc.v2(cc.dataMgr.screenW/2,cc.dataMgr.screenH/2));
        var nodepos = this.node.convertToNodeSpaceAR(camerapos);
        var collectionThingNode = cc.instantiate(this.collectionThingPrefab);
        this.node.addChild(collectionThingNode);
        collectionThingNode.position = nodepos;
        collectionThingNode.getComponent('thingImageAndAni').settingSpriteFrame(1, level);

        var targetPos = cc.pAdd(this.heartLabel.node.parent.position, cc.v2(70, 0));
        var action = cc.moveTo(1.0, targetPos);
        var action2 = cc.fadeOut(1.0);
        var together = cc.spawn(action, action2);
        var seq = cc.sequence(together, cc.callFunc(this.moveToLabelOver, this, collectionThingNode));
        collectionThingNode.runAction(seq);

        var heartStrength = cc.dataMgr.getHeartCountByLevel(level);
        cc.dataMgr.addHeartCount(heartStrength);

        cc.audioMgr.playEffect("heartGo");
    },

    // addHeartAndAni: function (worldpos, level) {
    //     // var worldpos =  this.game.camera.getComponent(cc.Camera).getCameraToWorldPoint(camerapos);
    //     // var nodepos = this.node.convertToNodeSpaceAR(camerapos);
    //     var nodepos = this.node.convertToNodeSpaceAR(worldpos);
    //     var collectionThingNode = cc.instantiate(this.collectionThingPrefab);
    //     this.node.addChild(collectionThingNode);
    //     collectionThingNode.position = nodepos;
    //     collectionThingNode.getComponent('thingImageAndAni').settingSpriteFrame(1, level);

    //     var targetPos = cc.pAdd(this.heartLabel.node.parent.position, cc.v2(70, 0));
    //     var action = cc.moveTo(1.0, targetPos);
    //     var action2 = cc.fadeOut(1.0);
    //     var together = cc.spawn(action, action2);
    //     var seq = cc.sequence(together, cc.callFunc(this.moveToLabelOver, this, collectionThingNode));
    //     collectionThingNode.runAction(seq);

    //     var heartStrength = cc.dataMgr.getHeartCountByLevel(level);
    //     cc.dataMgr.addHeartCount(heartStrength);

    //     cc.audioMgr.playEffect("heartGo");
    // },

    addCoinAndAni: function (camerapos, count) {
        var nodepos = this.node.convertToNodeSpaceAR(camerapos);
        var coinNode = cc.instantiate(this.coinPrefab);
        this.node.addChild(coinNode);
        coinNode.position = nodepos;
        coinNode.getChildByName('tips').getComponent(cc.Label).string = '+' + count;

        var targetPos = cc.pAdd(this.coinLabel.node.parent.position, cc.v2(70, 0));
        var action = cc.moveTo(1.0, targetPos);
        var action2 = cc.fadeOut(1.0);
        var together = cc.spawn(action, action2);
        var seq = cc.sequence(together, cc.callFunc(this.moveToLabelOver, this, coinNode));
        coinNode.runAction(seq);


        cc.dataMgr.addCoinCount(count);

        cc.audioMgr.playEffect("coin");
    },

    addDragonToNest: function (camerapos, level) {
        var nodepos = this.node.convertToNodeSpaceAR(camerapos);

        var dragonNode = cc.instantiate(this.dragonPrefab);
        // dragonNode.off(cc.Node.EventType.TOUCH_START,);
        // dragonNode.off(cc.Node.EventType.TOUCH_MOVE);
        // dragonNode.off(cc.Node.EventType.TOUCH_END);
        var ratio = this.game.camera.getComponent(cc.Camera).zoomRatio;
        dragonNode.scaleX = -ratio;
        dragonNode.scaleY = ratio;
        this.node.addChild(dragonNode);
        dragonNode.position = nodepos;
        dragonNode.getComponent('Dragon').setTypeAndLevel_forNewDragon(3, level);
        dragonNode.removeComponent('Dragon');
        // dragonNode.targetOff(dragonNode);
        // console.log("dragon target off");
        var targetPos = this.dragonNestNode.position;
        var action = cc.moveTo(2.0, targetPos);
        var action2 = cc.scaleTo(2.0, -0.5, 0.5);
        var together = cc.spawn(action, action2);
        var seq = cc.sequence(together, cc.callFunc(this.moveToDragonNestOver, this, dragonNode));
        dragonNode.runAction(seq);

        cc.dataMgr.pushDragonToNest(Date.now(), level);
    },

    moveToDragonNestOver: function (dragonNode) {
        this.dragonNestNode.getComponent(cc.Animation).play('nestin');
        dragonNode.destroy();
    },


    moveToLabelOver: function (moveNode) {
        moveNode.destroy();
        this.refreshUI();
    },

    cameraZoomOutClick: function () {
        var camera = this.game.camera.getComponent(cc.Camera);
        if (camera.zoomRatio > 0.5) {
            camera.zoomRatio -= 0.1;
        }
    },

    cameraZoomInClick: function () {
        var camera = this.game.camera.getComponent(cc.Camera);
        if (camera.zoomRatio < 1.0) {
            camera.zoomRatio += 0.1;
        }
    },


    //strength 用于显示龙 剩余的体力
    addDescForClick: function (thingType, thingLevel, strength) {
        //根据这个值 来处理 图鉴按钮被点击
        this.thingType = thingType;
        var descDatas = cc.dataMgr.getDescByTypeAndLevel(thingType, thingLevel);

        this.tujianBtnNode.active = true;
        //debugger;
        this.nameLevelLabel.string = descDatas.name + "-" + descDatas.levelDesc;
        if (thingType == 3 && thingLevel > 0) {
            this.descLabel.string = descDatas.desc + "  " + "剩余体力：" + strength;
        } else {
            this.descLabel.string = descDatas.desc;
        }

    },



    clearDescForUnClick: function () {
        this.nameLevelLabel.string = "未选中任何东西";
        this.descLabel.string = "";

        this.tujianBtnNode.active = false;
    },

    unDescClick: function () {
        cc.audioMgr.playEffect("UI");
        console.log("unDescClick");
        this.descNode.active = true;
        this.unDescNode.active = false;
    },

    descClick: function () {
        cc.audioMgr.playEffect("UI");
        console.log("descClick");
        this.descNode.active = false;
        this.unDescNode.active = true;
    },

    signInClick: function () {
        cc.audioMgr.playEffect("UI");
        this.sigInNode.active = true;
    },

    rouletteClick: function () {
        cc.audioMgr.playEffect("UI");
        this.rouletteNode.active = true;
    },


    //分享测试
    // shareClick: function () {
    //     console.log("分享按钮被点击");
    //     cc.audioMgr.playEffect("UI");
    //     cc.dataMgr.shareState = cc.dataMgr.ShareState.DANDELION_COUNT;

    //     window.Notification.on(cc.dataMgr.shareState, function (parameter) {
    //         console.log("分享回调");
    //         console.log(parameter);
    //     });

    //     cc.dataMgr.share();
    // },

    dragonHomeClick: function () {
        cc.audioMgr.playEffect("UI");
        this.dragonShare_Node.active = true;
    },

    // called every frame
    update: function (dt) {

    },

    reCheckpoint:function() {
        
        cc.audioMgr.playEffect("UI");

        cc.find("Canvas/loadingNode").getComponent(cc.Animation).play();

        this.checkPointTips_Node.getComponent("Checkpoint").setCurCheckpoint(this.curCheckpoint);
        this.checkPointTips_Node.getComponent("Checkpoint").beginCheckpoint();
        this.checkPointTips_Node.active = true;
       
       
      
        //删除主基地
        //加载关卡内容
        this.game.clearGame();
        this.game.loadGame(this.curCheckpoint);
    },

    nextCheckpoint:function() {
        this.curCheckpoint++;
        cc.audioMgr.playEffect("UI");

        cc.find("Canvas/loadingNode").getComponent(cc.Animation).play();

        this.checkPointTips_Node.getComponent("Checkpoint").setCurCheckpoint(this.curCheckpoint);
        this.checkPointTips_Node.getComponent("Checkpoint").beginCheckpoint();
        this.checkPointTips_Node.active = true;
       
       
      
        //删除主基地
        //加载关卡内容
        this.game.clearGame();
        this.game.loadGame(this.curCheckpoint);
    },

    goCheckpointList:function() {
        cc.audioMgr.playEffect("UI");

       
        cc.uiMgr.Push("MapChooseFrame", { index: cc.dataMgr.getCurCheckpoint() - 1 })
    },
});
