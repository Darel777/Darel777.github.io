class MVVM {
    constructor(options) {
        // 把id el和数据挂载到实例上
        this.$el = options.el;
        this.$data = options.data;
        // 如果模板存在就开始编译
        if (this.$el) {
            // 数据劫持，通过get和set实现控制
            new Observer(this.$data);
            // 用数据和元素进行编译
            new Compile(this.$el, this);
        }
        //功能实现
        //compile.ts 编译 实现单向绑定
        //compile.ts 中的传统监听 实现双向绑定
        //observer.ts 实现数据劫持
        //dep.ts watcher.ts 共同实现发布观察者模式
    }
}
