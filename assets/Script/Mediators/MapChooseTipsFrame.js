const {
    ccclass,
    property
} = cc._decorator;

@ccclass
export default class MapChooseTipsFrame extends cc.Component {
    onLoad(){
        //console.log("onLoad")
    }
    localInit(data){
        //console.log("localInit"+data.name+data.id)
        this.data = data
    }
    start() {
        var self = this
        var checkpoint_conf = cc.Config["checkpoint"][this.data.idx]
        var language_conf = cc.Config["language"][checkpoint_conf.item_language]
        this.node.getChildByName("title").getComponent(cc.Label).string = "第"+this.data.idx+"关"
        //this.node.getChildByName("desc").getComponent(cc.Label).string = cc.tools.stringFormat(language_conf.Chinese,checkpoint_conf.item)

        this.node.getChildByName("openBtn").on('click',function(event, customeData){
            window.Notification.emit("go_Checkpoint",{idx:self.data.idx});
            cc.uiMgr.pop();
        })
        this.node.getChildByName("closeBtn").on('click',function(event, customeData){
            self.node.destroy()
        })
        var a = "这是*一*个*测试"
        var b = "7,8,9"
        
        //console.log(cc.tools.stringFormat(a,b))
    }
   
}