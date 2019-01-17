
import DataMgr from 'DataMgr';
import AudioMgr from 'AudioMgr';
cc.Class({
    extends: cc.Component,

    properties: {
        camera: {
            default: null,
            type: cc.Node
        },

        thingPrefab: {
            default: null,
            type: cc.Prefab,
        },

        dragonPrefab: {
            default: null,
            type: cc.Prefab,
        },


        thingsNode: {
            default: null,
            type: cc.Node,
        },
        dragonsNode: {
            default: null,
            type: cc.Node,
        },

        nodeCloud: {
            default: null,
            type: cc.Node
        },



        maps: {
            default: [],
            type: cc.Prefab
        },
        // tilesHorizontalCount: {
        //     default: 0,
        //     displayName: "当前图的水平格子数",
        //     tooltip: "包括雾，以及空白的格子",
        // },

        // tileVerticalCount: {
        //     default: 0,
        //     displayName: "当前图的垂直格子数",
        //     tooltip: "包括雾，以及空白的格子",
        // },
    },

    // use this for initialization
    onLoad: function () {
        //console.log("game onload!");
        // this.tilesHorizontalCount = 6;
        // this.tileVerticalCount = 3;

        //cc.director.getCollisionManager().attachDebugDrawToCamera(this.camera.getComponent(cc.Camera));



        this.moveCameraXFlag = false;
        this.moveCameraYFlag = false;
        this.moveCameraXSpeed = 0.0;
        this.moveCameraYSpeed = 0.0;
        //哪个物体被拖动，又移动到了屏幕边缘，在改变摄像机位置的时候，这个物体需要跟着位移 而不是停留在世界坐标系下
        this.draggingObj = null;

        if (!cc.dataMgr) {
            cc.dataMgr = new DataMgr();
            cc.dataMgr.init();



            this.loadGame(null);
        }
        if (!cc.audioMgr) {
            cc.audioMgr = new AudioMgr();
            cc.audioMgr.onLoad();
        }
        //初始化最好写在start里面，我在别的地方有onload来初始化 Game里面的一些数据 比如tile里的onload
        this.ui = cc.find("Canvas/uiLayer").getComponent('UI');
    },

    initDragons: function () {

        var dragonDatas = cc.dataMgr.dragonDatas;
        if (!dragonDatas) {
            return;
        }
        for (var i = 0; i < dragonDatas.length; i++) {
            //this.addDragonToGame(dragonDatas[i].thingType, dragonDatas[i].thingLevel,i);

            var newDragon = cc.instantiate(this.dragonPrefab);
            //这里代码会把 龙的体力 设置为 默认数据，需要再设置一遍
            newDragon.getComponent('Dragon').setTypeAndLevel_forNewDragon(dragonDatas[i].thingType, dragonDatas[i].thingLevel);
            newDragon.getComponent('Dragon').strength = dragonDatas[i].strength;

            newDragon.position = dragonDatas[i].position;
            this.dragonsNode.addChild(newDragon);
        }
    },

    //原本想做一个通用的添加龙函数，但是有较多问题，！！！目前只支持从签到界面加入龙！
    addDragonToGame: function (thingType, thingLevel) {
        //各级龙的数据表


        var newDragon = cc.instantiate(this.dragonPrefab);
        //这里代码会把 龙的体力 设置为 默认数据，需要再设置一遍
        newDragon.getComponent('Dragon').setTypeAndLevel_forNewDragon(thingType, thingLevel);
        // newDragon.getComponent('Dragon').strength = dragonDatas[i].strength;

        var wp = this.ui.node.convertToWorldSpaceAR(cc.v2(0, 0));
        var np = this.dragonsNode.convertToNodeSpaceAR(wp);
        newDragon.position = np;
        this.dragonsNode.addChild(newDragon);
    },

    start: function () {

        cc.audioMgr.playBg();


        //云特效
        this.cloudEffect();

        //debugger;
        let self = this;
        //只专注于移动摄像机，其它的触摸由各自节点接收并吞没
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            //console.log('touch begin by game');
            let touchPos = event.getLocation();
            // console.log(touchPos);
            // console.log(cc.director.getVisibleSize());
            self._beginPos = touchPos;


            self.ui.clearDescForUnClick();

        }, this.node);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            if (self._beginPos) {
                //console.log('touch move by game');
                let movePos = event.getLocation();
                let addX = movePos.x - self._beginPos.x;
                let addY = movePos.y - self._beginPos.y;

                //移动相机

                let addPos = self.getAddPosition_v2(-addX, -addY)
                self.camera.setPosition(cc.v2(self.camera.x + addPos.x, self.camera.y + addPos.y));
                self._beginPos = movePos;


            }

        }, this.node);

    },


    clearGame: function () {
        // this.mapNode.removeAllChildren();
        // this.thingsNode.removeAllChildren();
        // this.dragonsNode.removeAllChildren();
        this.mapNode.destroy();
        this.thingsNode.removeAllChildren();
        this.dragonsNode.removeAllChildren();
        cc.dataMgr.tilesData = [];
    },

    //大厅地图 null 其他的按1，2,3排列
    loadGame: function (tag) {
        this.checkpointID = tag;
        if (tag == null) {
            cc.dataMgr.isHall = true;
            this.mapNode = cc.instantiate(this.maps[0]);

            //根据持久化数据，持久化龙层，todo：龙巢的恢复
            this.initDragons();

        } else {
           
            cc.dataMgr.isHall = false;
            this.mapNode = cc.instantiate(this.maps[tag]);
        }

        this.mapNode.setLocalZOrder(-1);
        this.node.getChildByName('gameLayer').addChild(this.mapNode);
        cc.dataMgr.initTile(tag, this.mapNode.children);

        this.thingsNode.position = this.mapNode.position;
        this.dragonsNode.position = this.mapNode.position;

        this.camera.position = cc.v2(0,0);
        //虽然很迷你，但本质上就是战争迷雾系统
        this.fogOfWarSystem();
        //调用草地变色，与自动描边
        this.grassSystem();

        
    },



    cloudEffect: function () {
        //云特效：上下自动
        for (let i = 0; i < this.nodeCloud.children.length; ++i) {
            let nodeN = this.nodeCloud.children[i];
            let randY = Math.random() * 40 + 15;

            var spawn1 = cc.spawn(cc.moveBy(2.5 + Math.random() * 2, cc.v2(0, randY)), cc.fadeTo(2.5 + Math.random() * 2, 150));
            var spawn2 = cc.spawn(cc.moveBy(1.5 + Math.random() * 2, cc.v2(0, -randY)), cc.fadeTo(1.5 + Math.random() * 2, 80));
            nodeN.runAction(cc.repeatForever(cc.sequence(spawn1, spawn2)));
        }

    },


    //战争迷雾，用于控制雾，周围有非雾就显示label并且可点击
    fogOfWarSystem: function () {
        // return;
        var hAndW = cc.dataMgr.getCurrentWidthAndHeight(this.checkpointID);
        var tileHeight = hAndW.h;
        var tileWidth = hAndW.w;

        //棋盘上是否还有雾
        var hasFog = false;
        for (var i = 0; i < tileHeight; i++) {
            for (var j = 0; j < tileWidth; j++) {
                var otherTile = cc.dataMgr.tilesData[i][j];
                var otherTileJS = otherTile.getComponent('Tile');
                //这个tile是否有雾
                var isFogTile = otherTileJS.isFogTile();
                
                if (isFogTile) {
                    hasFog = true;
                    //上下左右是否有草地
                    var isShowLabel = false;
                    if ((i > 0 && cc.dataMgr.tilesData[i - 1][j].getComponent('Tile').isGlassland())
                        || (i < tileHeight - 1 && cc.dataMgr.tilesData[i + 1][j].getComponent('Tile').isGlassland())
                        || (j > 0 && cc.dataMgr.tilesData[i][j - 1].getComponent('Tile').isGlassland())
                        || (j < tileWidth - 1 && cc.dataMgr.tilesData[i][j + 1].getComponent('Tile').isGlassland())) {
                        isShowLabel = true;
                    }
                    var fog = otherTileJS.fog;
                    var labelNode = fog.getChildByName('relockLabel');
                    var btnNode = fog.getChildByName("fog");
                    if (isShowLabel && !labelNode.active) {
                        labelNode.active = true;
                        btnNode.getComponent(cc.Button).interactable = true;
                    } else if (isShowLabel && labelNode.active) {

                    } else if (!isShowLabel && labelNode.active) {
                        labelNode.active = false;
                        btnNode.getComponent(cc.Button).interactable = false;
                    } else if (!isShowLabel && !labelNode.active) {

                    }
                }

            }
        }

        if(!hasFog) {
            window.Notification.emit("ALL_FOG_CLEAR");
        }
    },

    //草地系统，用于草地变色 自动描边
    grassSystem: function () {
        var hAndW = cc.dataMgr.getCurrentWidthAndHeight(this.checkpointID);
        var tileHeight = hAndW.h;
        var tileWidth = hAndW.w;
        for (var i = 0; i < tileHeight; i++) {
            for (var j = 0; j < tileWidth; j++) {
                var otherTile = cc.dataMgr.tilesData[i][j];
                var otherTileJS = otherTile.getComponent('Tile');
                //1先判断这个块是不是想要的块，如果是 才设置草地
                //2需要的信息是 块的上下左右是否有东西 没有就是0 有就是1 传入tile中
                 //用于标记上下左右的草是否显示
                 var grassInfo = [0, 0, 0, 0];
                if (otherTileJS.dontWant == 0) {
                   
                    if (i < 1 || cc.dataMgr.tilesData[i - 1][j].getComponent('Tile').dontWant) {
                        grassInfo[0] = 1;
                    }

                    if (i > tileHeight - 2 || cc.dataMgr.tilesData[i + 1][j].getComponent('Tile').dontWant) {
                        grassInfo[1] = 1;
                    }



                    if (j > tileWidth - 2 || cc.dataMgr.tilesData[i][j + 1].getComponent('Tile').dontWant) {
                        grassInfo[2] = 1;
                    }

                    if (j < 1 || cc.dataMgr.tilesData[i][j - 1].getComponent('Tile').dontWant) {
                        grassInfo[3] = 1;
                    }
                }
                otherTileJS.setGrassInfo(grassInfo);
            }
        }
    },

    // called every frame
    update: function (dt) {

    },


    //输入相机的 dx，dy，根据限制来加工处理，返回一份要求的dx，dy，防止移动出最大范围
    getAddPosition_v2: function (addX, addY) {
        if (addX < -cc.dataMgr.hallLeftWidth / 2 + cc.dataMgr.screenW / 2 - this.camera.x)
            addX = -cc.dataMgr.hallLeftWidth / 2 + cc.dataMgr.screenW / 2 - this.camera.x;
        if (addX > cc.dataMgr.hallRightWidth / 2 - cc.dataMgr.screenW / 2 - this.camera.x)
            addX = cc.dataMgr.hallRightWidth / 2 - cc.dataMgr.screenW / 2 - this.camera.x;
        if (addY < -cc.dataMgr.hallDownHeight / 2 + cc.dataMgr.screenH / 2 - this.camera.y)
            addY = -cc.dataMgr.hallDownHeight / 2 + cc.dataMgr.screenH / 2 - this.camera.y;
        if (addY > cc.dataMgr.hallUpHeight / 2 - cc.dataMgr.screenH / 2 - this.camera.y)
            addY = cc.dataMgr.hallUpHeight / 2 - cc.dataMgr.screenH / 2 - this.camera.y;
        return cc.v2(addX, addY);
    },

    //给如一个世界坐标，返回坐标下的tile，如果tile上有fog，就返回null
    getContainPointTile_FogIsNull: function (worldPos) {
        var tile = this.getContainPointTile(worldPos);
        if (tile && tile.getComponent('Tile').fog) {
            return null;
        }

        return tile;
    },

    getContainPointTile: function (worldPos) {

        //var touchPos = this.camera.getComponent(cc.Camera).getCameraToWorldPoint(touchPos);
        var hAndW = cc.dataMgr.getCurrentWidthAndHeight(this.checkpointID);
        var tileHeight = hAndW.h,
            tileWidth = hAndW.w;
        for (var i = 0; i < tileHeight; i++) {
            for (var j = 0; j < tileWidth; j++) {
                var points = cc.dataMgr.tilesData[i][j].getComponent(cc.PolygonCollider).points;
                var worldpoints = this.getWorldPoints(cc.dataMgr.tilesData[i][j], points);
                // //console.log(worldpoints);
                // var test = cc.dataMgr.tilesData[i][j].parent.convertToWorldSpaceAR(cc.dataMgr.tilesData[i][j].position);
                // console.log(touchPos);
                // console.log(test);
                if (cc.Intersection.pointInPolygon(worldPos, worldpoints)) {
                    // console.log('包含改触摸点的tile');
                    //console.log(cc.dataMgr.tilesData[i][j].getBoundingBoxToWorld());
                    //console.log(cc.dataMgr.tilesData[i][j]);
                    if (cc.dataMgr.tilesData[i][j].getComponent('Tile').dontWant == 0) {
                        return cc.dataMgr.tilesData[i][j];
                    }

                }
            }
        }
        return null;
    },

    getWorldPoints: function (node, points) {
        var worldPoints = [];
        for (var i = 0; i < points.length; i++) {
            worldPoints.push(node.convertToWorldSpaceAR(points[i]));
        }
        return worldPoints;
    },

    //以这个tile的tempthing为中心 查找出所有与其连通且同类型，同级别的thing数组
    findConnentedThing: function (tile) {
        var resultThings = [];

        var tileJS = tile.getComponent('Tile');
        var thisThing = tileJS.tempThing;
        var otherThing = tileJS.thing;

        resultThings.push(thisThing);
        var thisThingJS = thisThing.getChildByName('selectedNode').getComponent('Thing');
        //判断 格子内有没有别的thing，没有就不管了。若有还要判断是否一样
        if (otherThing) {
            //检查给此拖拽物同一个tile的物品的 是否和其相同，若相同加入

            var otherThingJS = otherThing.getChildByName('selectedNode').getComponent('Thing');
            if (this.IsThingSameTypeAndLevel(thisThingJS, otherThingJS)) {
                resultThings.push(otherThing);
            }
        }

        //这些原本也可以放入递归之中，但是我的数据结构比较麻烦，第一层先直接调用（第一层主要可能是两个节点）
        if (tileJS.index.x > 0) {
            this.checkConnectRecurse(tileJS.index.x - 1, tileJS.index.y, thisThingJS.thingType, thisThingJS.thingLevel, resultThings);
        }

        if (tileJS.index.x < cc.dataMgr.getCurrentWidthAndHeight(this.checkpointID).w - 1) {
            this.checkConnectRecurse(tileJS.index.x + 1, tileJS.index.y, thisThingJS.thingType, thisThingJS.thingLevel, resultThings);
        }

        if (tileJS.index.y > 0) {
            this.checkConnectRecurse(tileJS.index.x, tileJS.index.y - 1, thisThingJS.thingType, thisThingJS.thingLevel, resultThings);
        }

        if (tileJS.index.y < cc.dataMgr.getCurrentWidthAndHeight(this.checkpointID).h - 1) {
            this.checkConnectRecurse(tileJS.index.x, tileJS.index.y + 1, thisThingJS.thingType, thisThingJS.thingLevel, resultThings);
        }
        // console.log("-----查找连通算法结果------");
        // console.log(resultThings);
        return resultThings;
    },

    checkConnectRecurse: function (x, y, type, level, resultThings) {
        //先检测自己是否已经加入，是否是雾，是否有物体，是否很前面的一样  以上都通过，加入
        //是否已经加入
        var t = cc.dataMgr.tilesData[y][x];
        var tJS = t.getComponent('Tile');
        var compareThing = tJS.thing;
        //未知原因 块和脚本没有获得
        if (!t || !tJS) {
            debugger;
            return;
        }
        //空块
        if (tJS.dontWant == 1) {
            return;
        }
        //是雾
        if (tJS.tileType == 1) {
            return;
        }
        //没有thing
        if (!compareThing) {
            return;
        }

        //已经加入
        if (this.isChecked(compareThing, resultThings)) {

            return;
        }

        //检测是否一样
        if (this.IsThingSameTypeAndLevel_2(compareThing.getChildByName('selectedNode').getComponent('Thing'), type, level)) {
            //一切通过，加入，递归检测它的上下左右
            resultThings.push(compareThing);

            if (tJS.index.x > 0) {
                this.checkConnectRecurse(tJS.index.x - 1, tJS.index.y, type, level, resultThings);
            }

            if (tJS.index.x < cc.dataMgr.getCurrentWidthAndHeight(this.checkpointID).w - 1) {
                this.checkConnectRecurse(tJS.index.x + 1, tJS.index.y, type, level, resultThings);
            }

            if (tJS.index.y > 0) {
                this.checkConnectRecurse(tJS.index.x, tJS.index.y - 1, type, level, resultThings);
            }

            if (tJS.index.y < cc.dataMgr.getCurrentWidthAndHeight(this.checkpointID).h - 1) {
                this.checkConnectRecurse(tJS.index.x, tJS.index.y + 1, type, level, resultThings);
            }

        } else { //不一样
            return;
        }
    },


    IsThingSameTypeAndLevel_2(thisThingJS, thingType, thingLevel) {
        if (!thisThingJS) {
            debugger;
        }
        return (thisThingJS.thingType == thingType) && (thisThingJS.thingLevel == thingLevel) ? true : false;
    },
    IsThingSameTypeAndLevel(thisThingJS, otherThingJS) {

        return (thisThingJS.thingType == otherThingJS.thingType) && (thisThingJS.thingLevel == otherThingJS.thingLevel) ? true : false;
    },

    //检查thing是否已经加入
    isChecked: function (compareThing, resultThings) {

        for (var i = 0; i < resultThings.length; i++) {
            if (compareThing == resultThings[i]) {
                return true;
            }
        }
        return false;
    },

    //检查tile是否已经加入

    isChecked_Tile: function (compareTile, resultTiles) {

        for (var i = 0; i < resultTiles.length; i++) {
            if (compareTile == resultTiles[i]) {
                return true;
            }
        }
        return false;

    },

    //输入一个 tile，找到离这个tile最近的n个tile(可用类别，非雾，没有物体)
    getNearestTileByN: function (tile, N) {
        var resultTiles = [];
        var allEmptyTiles = [];//所有空闲的tile 然后按照距离排序
        var hAndW = cc.dataMgr.getCurrentWidthAndHeight(this.checkpointID);
        var tileHeight = hAndW.h;
        var tileWidth = hAndW.w;

        for (var i = 0; i < tileHeight; i++) {
            for (var j = 0; j < tileWidth; j++) {
                var otherTile = cc.dataMgr.tilesData[i][j];
                //如果是空的tile
                if (otherTile.getComponent('Tile').isEmptyTile()) {
                    //计算与传入的进来的tile的距离 返回平方即可，性能高，毕竟我是找最近的
                    var dist = cc.pDistanceSQ(tile.position, otherTile.position);
                    //console.log("dist-->   " + dist);
                    allEmptyTiles.push({ "tile": otherTile, "dist": dist });
                }
            }
        }
        //console.log(allEmptyTiles);
        //按照距离排序
        allEmptyTiles.sort(function (a, b) {
            if (a.dist > b.dist) {
                return 1;
            } else if (a.dist < b.dist) {
                return -1;
            } else {
                return 0;
            }
        });

        if (allEmptyTiles.length < N) {
            debugger;
        }

        for (var i = 0; i < N; i++) {
            resultTiles.push(allEmptyTiles[i].tile);
        }

        return resultTiles;
    },


    //以 (0,0)为中心找到空闲tile
    getTile: function (pos) {
        var tempPos;
        if (pos) {
            tempPos = pos;
        } else {
            tempPos = cc.v2(0, 0);
        }



        var resultTiles = this.getNearestTileByN_pos(tempPos, 1);
        if (resultTiles != null) {
            return resultTiles[0];
        } else {
            return null;
        }
    },

    //输入一个things 数组，返回一个 生成的things 数组
    unionAlgorithm: function (thingsArray, currentNearestTile) {
        //1 先取出第一个thing的关联tile 将来以这个搜寻空格
        //2 让所有待合并的thing的tile取消关联 并置为空，这样才能进行搜索空格
        //3 根据type level 公式  生成 unionedThingsArray
        //4 根据unionedThingsArray数量 搜寻最近的N个空格
        //5 一一放入，放入后 执行 生成动画

        //1
        var thing0 = thingsArray[0];
        var thing0TileJS = thingsArray[0].getChildByName('selectedNode').getComponent('Thing').relationTileJS;


        //unionedThingsArray 元素结构
        var thingData = {
            'thing': thing0,
            'thingType': thing0TileJS.thingType,
            'thingLevel': thing0TileJS.thingLevel
        };

        for (var i = 0; i < thingsArray.length; i++) {
            var tempTileJs = thingsArray[i].getChildByName('selectedNode').getComponent('Thing').relationTileJS;
            tempTileJs.thing = null;
            tempTileJs.thingType = 0;
            tempTileJs.thingLevel = 0;
            thingsArray[i].removeFromParent(false);
        }


        var unionedThingsArray = this.generateUnionedThings(thingsArray.length, thingData.thingType, thingData.thingLevel);

        var resultTiles = this.getNearestTileByN(currentNearestTile, unionedThingsArray.length);
        if (resultTiles.length < unionedThingsArray.length) {
            debugger;
        }

        for (var i = 0; i < unionedThingsArray.length; i++) {
            unionedThingsArray[i].thing.position = currentNearestTile.position;
            //飞龙 放入 龙层
            if (unionedThingsArray[i].thingType == 3 && unionedThingsArray[i].thingLevel != 0) {
                this.dragonsNode.addChild(unionedThingsArray[i].thing);

                cc.audioMgr.playEffect("dragon");

                window.Notification.emit("EGG_TO_DRAGON");
            } else {
                this.thingsNode.addChild(unionedThingsArray[i].thing);
                var thingJs = unionedThingsArray[i].thing.getChildByName('selectedNode').getComponent('Thing');
                thingJs.changeInTile(resultTiles[i], unionedThingsArray[i].thingLevel, unionedThingsArray[i].thingType);

                //精华合成音
                if (unionedThingsArray[i].thingType == 1) {
                    cc.audioMgr.playEffect("heart");

                    if(unionedThingsArray[i].thingLevel == 1) {
                        window.Notification.emit("HEART_1");
                    }

                    if(unionedThingsArray[i].thingLevel == 2) {
                        window.Notification.emit("HEART_2");
                    }
                }
                //花合成音
                else if (unionedThingsArray[i].thingType == 2) {
                    cc.audioMgr.playEffect("flower");


                    var reward = cc.dataMgr.getFlowerUnionRewardByLevel(unionedThingsArray[i].thingLevel);
                    if (reward != null) {
                        var tipsLabel = unionedThingsArray[i].thing.getChildByName("tipsNode").getChildByName("tipsLabel").getComponent(cc.Label);
                        tipsLabel.string = "+" + reward + "精华";
                        cc.dataMgr.addHeartCount(reward);
                        this.ui.refreshUI();
                        tipsLabel.node.getComponent(cc.Animation).play('tipsLabel');
                    }




                    window.Notification.emit("MERGE_FLOWER");

                    if(unionedThingsArray[i].thingLevel == 2) {
                        window.Notification.emit("FLOWER_2");
                    }

                    if(unionedThingsArray[i].thingLevel == 3) {
                        window.Notification.emit("FLOWER_3");
                    }
                }
            }
        }

    },

    union_Dragons_Algorithm: function (curCanUnionedDragons) {
        var dragon0 = curCanUnionedDragons[0];
        var dragon0JS = curCanUnionedDragons[0].getComponent('Dragon');

        var dragonData = {
            'dragon': dragon0,
            'thingType': dragon0JS.thingType,
            'thingLevel': dragon0JS.thingLevel
        };
        //先把要合并的龙从父节点删除
        for (var i = 0; i < curCanUnionedDragons.length; i++) {

            curCanUnionedDragons[i].removeFromParent(false);
        }

        var unionedThingsArray = this.generateUnionedThings(curCanUnionedDragons.length, dragonData.thingType, dragonData.thingLevel);

        var dragonsPositions = this.getDragonPositionsByN(dragon0, unionedThingsArray.length);
        if (dragonsPositions.length < unionedThingsArray.length) {
            debugger;
        }

        for (var i = 0; i < unionedThingsArray.length; i++) {
            unionedThingsArray[i].thing.position = dragonsPositions[i];
            this.dragonsNode.addChild(unionedThingsArray[i].thing);

            cc.audioMgr.playEffect("dragon");
        }
    },

    getNearestTileByN_pos: function (pos, N) {
        var resultTiles = [];
        var allEmptyTiles = [];//所有空闲的tile 然后按照距离排序
        var hAndW = cc.dataMgr.getCurrentWidthAndHeight(this.checkpointID);
        var tileHeight = hAndW.h;
        var tileWidth = hAndW.w;

        for (var i = 0; i < tileHeight; i++) {
            for (var j = 0; j < tileWidth; j++) {
                var otherTile = cc.dataMgr.tilesData[i][j];
                //如果是空的tile
                if (otherTile.getComponent('Tile').isEmptyTile()) {
                    //计算与传入的进来的tile的距离 返回平方即可，性能高，毕竟我是找最近的
                    var dist = cc.pDistanceSQ(pos, otherTile.position);
                    //console.log("dist-->   " + dist);
                    allEmptyTiles.push({ "tile": otherTile, "dist": dist });
                }
            }
        }
        //console.log(allEmptyTiles);
        //按照距离排序
        allEmptyTiles.sort(function (a, b) {
            if (a.dist > b.dist) {
                return 1;
            } else if (a.dist < b.dist) {
                return -1;
            } else {
                return 0;
            }
        });

        if (allEmptyTiles.length < N) {
            //debugger;
            //没有空格
            return null;
        }

        for (var i = 0; i < N; i++) {
            resultTiles.push(allEmptyTiles[i].tile);
        }

        return resultTiles;
    },

    getNearestTileByN: function (tile, N) {

        var resultTiles = this.getNearestTileByN_pos(tile.position, N);

        return resultTiles;
    },

    //给一条位于中心的龙，用他的位置返回N个周围的位置
    getDragonPositionsByN: function (dragon0, N) {

        if (N > 8) {
            debugger;
        }
        var dragonsPositions = [];
        var center = dragon0.position;
        for (var i = 0; i < N; i++) {
            var position = cc.pAdd(center, cc.v2(cc.dataMgr.dragonsOffset[i]));

            dragonsPositions.push(position);
        }

        return dragonsPositions;
    },

    generateThing: function (thingType, thingLevel) {
        var newThing = cc.instantiate(this.thingPrefab);
        newThing.getChildByName('selectedNode').getComponent('Thing').setTypeAndLevel_forNewThing(thingType, thingLevel);
        return newThing;
    },

    //输入thingsArray 输出以thingData为结构的 数组
    generateUnionedThings: function (length, type, level) {
        //连击奖励公式 len = len +(len-3)/2;
        var newLen = length + Math.floor((length - 3) >> 1);
        //results是个数组，每个子的 type level可能不一样
        var results = this._generateUnionedThings(newLen, type, level);
        for (var i = 0; i < results.length; i++) {
            //龙类 且不是龙蛋
            if (results[i].thingType == 3) {
                if (results[i].thingLevel != 0) {
                    var newDragon = cc.instantiate(this.dragonPrefab);
                    newDragon.getComponent('Dragon').setTypeAndLevel_forNewDragon(results[i].thingType, results[i].thingLevel);
                    results[i].thing = newDragon;
                } else {
                    var newThing = this.generateThing(results[i].thingType, results[i].thingLevel);
                    results[i].thing = newThing;
                }
            } else {
                var newThing = this.generateThing(results[i].thingType, results[i].thingLevel);
                results[i].thing = newThing;
            }
        }
        // console.log(results);
        return results;
    },

    _generateUnionedThings: function (newLen, type, level) {
        var results = [];

        var maxLevel = cc.dataMgr.getMaxLevelByType(type);

        while (newLen > 0) {

            var remainder = -1;
            //最高级的情况下 不能再合并了，不然没有图片支持
            if (level < maxLevel) {
                remainder = newLen % 3;
                newLen = Math.floor(newLen / 3);
            } else {
                remainder = newLen;
                newLen = 0;
            }

            // var remainder = newLen % 3;
            // newLen = Math.floor(newLen / 3);

            for (var i = 0; i < remainder; i++) {

                //这里要对type 和level进行判断 然后分类 生成 龙，或者在tile上的 目前先不管

                var thingData = {
                    //'thing': newThing,
                    'thingType': type,
                    'thingLevel': level
                }
                results.unshift(thingData);
            }
            level++;
        }

        // console.log("====合并的结果====");

        // console.log(results);

        return results;
    },

    findCanUnionDragons: function (dragonNode) {
        var results = [];
        results.push(dragonNode);
        var dragonNodeJS = dragonNode.getComponent('Dragon');
        var type = dragonNodeJS.thingType;
        var level = dragonNodeJS.thingLevel;
        var dragons = this.dragonsNode.children;
        for (let i = 0; i < dragons.length; i++) {
            var dragonIJS = dragons[i].getComponent('Dragon');
            if (dragonNode !== dragons[i] && type == dragonIJS.thingType && level == dragonIJS.thingLevel) {
                var dis = cc.pDistance(dragonNode.position, dragons[i].position);
                //console.log(dis);
                if (dis < 2 * dragonNodeJS.detectionRadius) {
                    results.push(dragons[i]);
                }
            }
        }
        return results;
    },

    collectionFlower: function (dragonJS, worldpos) {
        var tile = this.getContainPointTile(worldpos);
        if (tile != null) {
            var tileJS = tile.getComponent('Tile');
            //是绿地 不是雾
            if (tileJS.tileType == 0) {

                //有thing 且类型是花
                if (tileJS.thing != null) {
                    var thingJS = tileJS.thing.getChildByName('selectedNode').getComponent('Thing');
                    if (thingJS.thingType == 2) {
                        var minLevel = cc.dataMgr.getCollectionMinDragonLevel(thingJS.thingLevel);
                        if (minLevel == null) {
                            //console.log("花的级别不够！！");

                            dragonJS.changeLabel("花的级别不够!");
                        }
                        else if (minLevel <= dragonJS.thingLevel) {
                            dragonJS.collectionState = true;
                            dragonJS.playCollection(thingJS.thingLevel);
                        }
                        else {
                            //console.log("龙的级别不够！！");

                            dragonJS.changeLabel("龙的级别不够!");
                        }

                    }
                }
            }
        }
    },


    //专注于将商城购买成功的物品，放入tile中
    generateAndPutThing_shop: function (tile, thingName) {
        switch (thingName) {
            case "treasureChest":
                var tileJS = tile.getComponent("Tile");
                tileJS.generateTreasureChest();
                break;
            case "dragonEgg":
                var newThing = this.generateThing(3, 0);
                this.thingsNode.addChild(newThing);
                newThing.position = tile.position;
                var thingJs = newThing.getChildByName('selectedNode').getComponent('Thing');
                thingJs.changeInTile(tile, 0, 3);
                break;

            default:
                //不可能执行到这里，用户买的到底是什么？
                debugger;
        }
    },

    //专注于每日登陆的奖励，放入tile中 没有使用type 用的是name，这是由于数据结构的定义不同，参见 每日登陆数据结构
    generateAndPutThing_signIn: function (tile, thingName, thingLevel) {
        switch (thingName) {
            case "treasureChest":
                var tileJS = tile.getComponent("Tile");
                tileJS.generateTreasureChest();
                break;

            default:
                //处理宝箱，其他放入tile的物品逻辑一样
                var thingType = 0;
                if (thingName == "heart") {
                    thingType = 1;
                } else if (thingName == "flower") {
                    thingType = 2;
                } else if (thingName == "draggon") {
                    thingType = 3;
                }
                if (thingType == 3 && thingLevel != 0) {
                    console.log("这里必须放入可以放入tile中的物体，不能放入飞龙，外部进行判断！！");
                    debugger;
                }
                var newThing = this.generateThing(thingType, thingLevel);
                this.thingsNode.addChild(newThing);
                newThing.position = tile.position;
                var thingJs = newThing.getChildByName('selectedNode').getComponent('Thing');
                thingJs.changeInTile(tile, thingLevel, thingType);
                break;
        }
    },

    //找到一条可以去采集的龙 在龙层搜索 并且不是采集状态的
    findCanCollectionDraggon: function () {
        var draggons = this.dragonsNode.children;
        for (var i = 0; i < draggons.length; i++) {
            if (!draggons[i].getComponent('Dragon').collectionState && !draggons[i].getComponent('Dragon').movingToFlowerState) {
                return draggons[i];
            }
        }

        return null;
    },

    changeCameraPosition: function (touchPos, draggingObj) {
        //console.log(touchPos);
        var addx = 8;
        var addy = 8;
        this.draggingObj = draggingObj;
        if (touchPos.x < cc.dataMgr.edgeMoveCamera || touchPos.x > cc.dataMgr.screenW - cc.dataMgr.edgeMoveCamera) {
            this.moveCameraXFlag = true;
            if (touchPos.x < cc.dataMgr.edgeMoveCamera) {
                this.moveCameraXSpeed = -addx;
            } else {
                this.moveCameraXSpeed = addx;
            }
        } else {
            this.moveCameraXFlag = false;
            this.moveCameraXSpeed = 0;
        }

        if (touchPos.y < cc.dataMgr.edgeMoveCamera || touchPos.y > cc.dataMgr.screenH - cc.dataMgr.edgeMoveCamera) {
            this.moveCameraYFlag = true;
            if (touchPos.y < cc.dataMgr.edgeMoveCamera) {
                this.moveCameraYSpeed = -addy;
            } else {
                this.moveCameraYSpeed = addy;
            }
        } else {
            this.moveCameraYFlag = false;
            this.moveCameraYSpeed = 0;
        }
    },

    stopCamera: function () {
        this.moveCameraXFlag = false;
        this.moveCameraYFlag = false;
        this.draggingObj = null;
    },

    //移动摄像机
    lateUpdate: function (dt) {
        if (this.moveCameraXFlag) {
            let addPos = this.getAddPosition_v2(this.moveCameraXSpeed, 0);
            this.draggingObj.setPosition(cc.v2(this.draggingObj.x + addPos.x, this.draggingObj.y + addPos.y));
            this.camera.setPosition(cc.v2(this.camera.x + addPos.x, this.camera.y + addPos.y));
        }

        if (this.moveCameraYFlag) {
            let addPos = this.getAddPosition_v2(0, this.moveCameraYSpeed);
            this.draggingObj.setPosition(cc.v2(this.draggingObj.x + addPos.x, this.draggingObj.y + addPos.y));
            this.camera.setPosition(cc.v2(this.camera.x + addPos.x, this.camera.y + addPos.y));
        }
    }

});