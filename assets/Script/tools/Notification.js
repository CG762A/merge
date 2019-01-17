import UIMgr from 'UIMgr';
import Tools from 'Tools';
const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class Notification extends cc.Component {
    onLoad(){
        //console.log("onLoad")
        // 全局通知
        window.Notification = {
            _eventMap: [],

            on: function(type, callback, target) {
                if (this._eventMap[type] === undefined) {
                    this._eventMap[type] = [];
                }
                this._eventMap[type].push({ callback: callback, target: target });
            },

            emit: function(type, parameter) {
                var array = this._eventMap[type];
                if (array === undefined) return;
                
                for (var i = 0; i < array.length; i++) {
                    var element = array[i];
                    if (element) element.callback.call(element.target, parameter);
                }
            },

            off: function(type, callback) {
                var array = this._eventMap[type];
                if (array === undefined) return;

                for (var i = 0; i < array.length; i++) {
                    var element = array[i];
                    if (element && element.callback === callback) {
                        array[i] = undefined;
                        break;
                    }
                }
            },


            //李浩添加：用于取消某个对象身上的某个事件派发
            off_target: function(type, target) {
                var array = this._eventMap[type];
                if (array === undefined) return;

                for (var i = 0; i < array.length; i++) {
                    var element = array[i];
                    if (element && element.target === target) {
                        array[i] = undefined;
                        break;
                    }
                }
            },

            offType: function(type) {
                this._eventMap[type] = undefined;
            },
        };
        if (!cc.uiMgr) {
            cc.uiMgr = new UIMgr();
            //cc.ModuleMgr = new ModuleMgr()
        }
        if (!cc.tools) {
            cc.tools = new Tools();
            //cc.ModuleMgr = new ModuleMgr()
        }
        cc.Config = []
        this.loadjson("checkpoint")
        this.loadjson("language")
        
    }
    localInit(data){
        //console.log("localInit"+data.name+data.id)
    }
    start() {
        //console.log("start")
        cc.uiMgr.loadPrefab("controller",{},{add:false,parentName:"Canvas/UI2d"})
        cc.uiMgr.loadPrefab("ReturnHall",{},{add:false,parentName:"Canvas/UI2dUp"})
    }
    loadjson(name){
        var self = this
        cc.loader.loadRes("data/"+name, function(err,res){
            if (err) {
                cc.log(err);
            }else{
                let list=res;
                cc.log(list);
                cc.Config[name] = list.json
            }
        })
    }
    SaveJsonData(data){

    }
    update(){}
}