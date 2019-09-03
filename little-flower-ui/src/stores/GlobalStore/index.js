import { observable, action } from "mobx";

class GlobalStore {
  @observable isAttachJvm;

  constructor() {
    this.isAttachJvm = false;
  }

  @action setAttachJvmStatus = (status) => {
    this.isAttachJvm = status;
  };
}

const globalStore = new GlobalStore();

export default globalStore;
export { GlobalStore };
