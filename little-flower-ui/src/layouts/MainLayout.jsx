import React, { Component } from "react";
import {
  Layout,
  Menu,
  Icon,
  Avatar,
  Button,
  Affix,
  Drawer,
  List,
  message,
  Card,
  Input,
  InputNumber
} from "antd";
import { withRouter } from "react-router-dom";
import "../styles/style.scss";
import logo from "../asset/photo.jpeg";
import { observer, inject } from "mobx-react";
import { api, getData } from "../request";

const { Header, Sider, Content, Footer } = Layout;

@inject("menuStore")
@inject("globalStore")
@observer
class MainLayout extends Component {
  state = {
    collapsed: false,
    drawerShow: false,
    jvmList: [],
    remoteHost: '',
    remotePort: 8080
  };

  componentWillMount() {
    if (!this.props.globalStore.isAttachJvm) {
      this.showJvmDrawer();
    }
  }

  onCollapse = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  goto = e => {
    this.props.history.push(e.key);
  };

  switchMenuStyle = () => {
    this.props.menuStore.toogleMenuStyle();
  };

  showJvmDrawer = () => {
    this.loadLocalJvm();
    this.setState({
      drawerShow: true
    });
  };

  loadLocalJvm = () => {
    getData(api.getLocalJvms, {}).then(res => {
      if (res.success) {
        this.setState({
          jvmList: res.data || []
        });
      }
    });
  };

  hostnameChange = (e) =>{
    this.setState({
      remoteHost:e.target.value
    })
  }

  portChange = (value) =>{
    this.setState({
      remotePort: value
    })
  }

  attachRemote = ()=>{
    const me = this;
    getData(api.attachRemoteJvm, { host: this.state.remoteHost,port:this.state.remotePort }).then(res => {
      if (res.success) {
        me.props.globalStore.setAttachJvmStatus(true);
        me.setState({
          drawerShow: false
        });
      } else {
        message.error("连接失败");
      }
    });
  }

  attach = pid => {
    const me = this;
    getData(api.attachLocalJvm, { pid: pid }).then(res => {
      if (res.success) {
        me.props.globalStore.setAttachJvmStatus(true);
        me.setState({
          drawerShow: false
        });
      } else {
        message.error("连接失败");
      }
    });
  };

  render() {
    const { isLeftMenu } = this.props.menuStore;
    return (
      <Layout>
        <Header className="layout-header">
          <div className={!isLeftMenu ? "top-menu-logo" : "left-menu-logo"}>
            <Avatar src={logo} />
            <span
              style={{
                color: "white",
                fontWeight: "bold",
                padding: "10px 0 0 15px"
              }}
            >
              古时的风筝
            </span>
            {isLeftMenu && (
              <Button
                type="default"
                onClick={this.onCollapse}
                style={{ marginLeft: "30px", marginBottom: 16 }}
              >
                <Icon
                  type={this.state.collapsed ? "menu-unfold" : "menu-fold"}
                />
              </Button>
            )}
          </div>
          {!isLeftMenu && (
            <div style={{ float: "left" }}>
              <Menu
                theme="dark"
                mode="horizontal"
                onClick={this.goto}
                defaultSelectedKeys={["/"]}
                style={{ lineHeight: "64px", width: "500px" }}
              >
                <Menu.Item key="/">
                  <Icon type="pie-chart" />
                  <span>仪表盘</span>
                </Menu.Item>
                <Menu.Item key="domain">
                  <Icon type="apartment" />
                  <span>MBeans</span>
                </Menu.Item>
                <Menu.Item key="about">
                  <span>关于</span>
                </Menu.Item>
              </Menu>
            </div>
          )}
          <div style={{ float: "right" }}>
            <Button
              onClick={this.switchMenuStyle}
              className="switch-menu-btn"
              ghost
            >
              切换导航风格
            </Button>
          </div>
        </Header>
        <Layout>
          {isLeftMenu && (
            <Sider
              width={200}
              style={{ background: "#fff" }}
              collapsed={this.state.collapsed}
            >
              <Menu
                mode="inline"
                theme="dark"
                onClick={this.goto}
                defaultSelectedKeys={["/"]}
                style={{ height: "100%", borderRight: 0 }}
              >
                <Menu.Item key="/">
                  <Icon type="pie-chart" />
                  <span>仪表盘</span>
                </Menu.Item>
                <Menu.Item key="domain">
                  <Icon type="apartment" />
                  <span>MBeans</span>
                </Menu.Item>
                <Menu.Item key="about">
                  <span>关于</span>
                </Menu.Item>
              </Menu>
            </Sider>
          )}
          <Layout>
            <Content style={{ margin: "10px 16px" }}>
              <Affix style={{ position: "absolute", top: 70, right: 30 }}>
                <div>
                  <Button
                    type="primary"
                    shape="circle"
                    icon="api"
                    onClick={this.showJvmDrawer}
                  />
                </div>
              </Affix>
              <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
                {this.props.children}
              </div>
            </Content>
            <Footer style={{ textAlign: "center" }}>古时的风筝</Footer>

            <Drawer
              title="连接 JVM"
              width={620}
              onClose={() => {
                this.setState({
                  drawerShow: false
                });
              }}
              visible={this.state.drawerShow}
            >
              <List
                header={<div>本地 JVM</div>}
                footer={null}
                bordered
                dataSource={this.state.jvmList}
                renderItem={item => (
                  <List.Item key={item.name}>
                    <List.Item.Meta
                      title={
                        <span>
                          {item.name}:{item.pid}
                        </span>
                      }
                    />
                    <div>
                      <Button
                        type="primary"
                        onClick={this.attach.bind(this, item.pid)}
                        icon="code"
                      >
                        连接
                      </Button>
                    </div>
                  </List.Item>
                )}
              />
              <br />
              <Card title="连接远程 JVM">
                <Input
                  type="text"
                  onChange={this.hostnameChange}
                  placeholder="远程服务器IP或hostname"
                  style={{ width: "50%" }}
                />
                &nbsp;:&nbsp;
                <InputNumber placeholder="端口" onChange={this.portChange} />
                &nbsp;&nbsp;
                <Button type="primary" onClick={this.attachRemote} icon="code">
                  连接
                </Button>
              </Card>
            </Drawer>
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

export default withRouter(MainLayout);
