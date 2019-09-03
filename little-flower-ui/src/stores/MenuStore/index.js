import { observable, action } from "mobx";

class MenuStore {
  @observable isLeftMenu;

  constructor() {
    this.isLeftMenu = false;
  }

  @action toogleMenuStyle = () => {
    this.isLeftMenu = !this.isLeftMenu;
  };
}

const menuStore = new MenuStore();

export default menuStore;
export { MenuStore };
