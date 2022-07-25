class Dep {
    constructor() { this.subscribers = []; } // 订阅的数组
    addSub(watcher) { this.subscribers.push(watcher); }
    notify() { this.subscribers.forEach(watcher => watcher.update()); }
}
