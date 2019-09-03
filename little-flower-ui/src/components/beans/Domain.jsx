import React from "react";
import {
  Tree,
  Tooltip,
  Breadcrumb,
  Row,
  Col,
  Descriptions,
  Icon,
  Table,
  Tag,
  Popover,
  Modal,
  Button,
  List,
  Card,
  message
} from "antd";

import { api, getData } from "../../request";
import "../../styles/style.scss";

const { TreeNode } = Tree;

class Domain extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      properties: [],
      visible: false,
      compositeDataList: [],
      operationList: [],
      notityList: [],
      currentFullName: ""
    };
  }

  componentWillMount() {
    this.loadData();
  }

  loadData = () => {
    const me = this;
    getData(api.getDomains, {}).then(res => {
      if (res.success) {
        me.setState({
          data: res.data || []
        });
      }
    });
  };

  renderTree = data => {
    return data.map(domain => {
      return (
        <TreeNode
          title={
            <Tooltip placement="right" title={domain.fullName}>
              {domain.title}
            </Tooltip>
          }
          key={domain.key}
        >
          {this.renderTree(domain.children || [])}
        </TreeNode>
      );
    });
  };

  renderValue = value => {
    if (value.compositeData) {
      const data = value.data;
      if (!Array.isArray(data)) {
        return this.buildPropertiesTags(data);
      } else {
        return (
          <Button
            type="primary"
            onClick={this.viewCompositeDataList.bind(this, data)}
            icon="search"
          >
            查看详细
          </Button>
        );
      }
    } else {
      const v = `${value.data}`;
      if (v.length > 50) {
        return (
          <Popover
            content={v}
            style={{
              width: "700px",
              wordWrap: "break-word",
              wordBreak: "break-all"
            }}
            trigger="hover"
          >
            <span>{v.substr(0, 50) + "..."}</span>
          </Popover>
        );
      } else {
        return v;
      }
    }
  };

  buildPropertiesTags = data => {
    console.log(data);
    let lis = [];
    for (let key in data) {
      let tKey = key + new Date();
      lis.push(
          <Tag key={tKey}>
            {key}:{data[key].toString()}
          </Tag>
        );
      
    }
    return lis;
  };

  viewCompositeDataList = data => {
    this.setState({
      compositeDataList: data,
      visible: true
    });
  };

  getColumns() {
    return [
      {
        title: "属性名称",
        dataIndex: "name"
      },
      {
        title: "属性值",
        dataIndex: "value",
        render: text => (text ? this.renderValue(text) : null)
      },
      {
        title: "是否可读",
        dataIndex: "attributeInfo.readable",
        render: text =>
          text ? (
            <Icon type="check-circle" theme="twoTone" />
          ) : (
            <Icon type="close-circle" theme="twoTone" />
          )
      },
      {
        title: "是否可写",
        dataIndex: "attributeInfo.writable",
        render: text =>
          text ? (
            <Icon type="check-circle" theme="twoTone" />
          ) : (
            <Icon type="close-circle" theme="twoTone" />
          )
      },
      {
        title: "类型",
        dataIndex: "attributeInfo.type",
        render: text => (text ? <Tag color="#87d068">{text}</Tag> : null)
      }
    ];
  }

  onSelect = (key, e) => {
    const isLeaf = e.node.props.children.length === 0;
    this.setState({
      currentFullName: key
    });
    if (isLeaf) {
      getData(api.getProperties, { fullName: key }).then(res => {
        if (res.success) {
          this.setState({
            properties: res.data.beanAttributeInfos,
            operationList: res.data.operationInfos,
            notityList: res.data.notificationInfos
          });
        }
      });
    }
  };

  invokeMethod = (methodName, e) => {
    getData(api.invokeMethod, {
      fullName: this.state.currentFullName,
      methodName: methodName
    }).then(res => {
      if (res.success) {
        message.success("方法执行成功");
      } else {
        message.error(res.errorMessage);
      }
    });
  };
  render() {
    return (
      <div className="dominas">
        <Breadcrumb style={{ marginTop: "-10px", paddingBottom: "10px" }}>
          <Breadcrumb.Item>JMX</Breadcrumb.Item>
          <Breadcrumb.Item>MBean</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={16}>
          <Col span={6}>
            <Descriptions
              title=""
              className="bean-tree"
              layout="vertical"
              bordered
            >
              <Descriptions.Item label="MBeans">
                <Tree
                  onSelect={this.onSelect}
                  style={{ maxHeight: "500px", overflowY: "auto" }}
                >
                  {this.renderTree(this.state.data)}
                </Tree>
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={18}>
            <Card title="属性集合">
              <Table
                rowKey="name"
                columns={this.getColumns()}
                dataSource={this.state.properties}
                style={{ overflowY: "auto" }}
                onExpand={this.getOneRowData}
                pagination={false}
              />
            </Card>
            <br />
            <List
              header={<div>操作集合</div>}
              footer={null}
              bordered
              dataSource={this.state.operationList}
              renderItem={item => (
                <List.Item key={item.name}>
                  <List.Item.Meta
                    title={
                      <span>
                        {item.returnType} {item.name}
                      </span>
                    }
                    description={item.description}
                  />
                  <div>
                    <Button
                      type="primary"
                      onClick={this.invokeMethod.bind(this, item.name)}
                      icon="code"
                    >
                      执行
                    </Button>
                  </div>
                </List.Item>
              )}
            />

            <br />
            <List
              header={<div>通知集合</div>}
              footer={null}
              bordered
              dataSource={this.state.notityList}
              renderItem={item => (
                <List.Item key={item.name}>
                  <List.Item.Meta
                    title={<span>{item.name}</span>}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Col>
        </Row>

        <Modal
          title={""}
          width={800}
          closable={true}
          footer={null}
          visible={this.state.visible}
          onCancel={() =>
            this.setState({
              visible: false
            })
          }
        >
          <Table
            rowKey="name"
            columns={[
              {
                title: "名称",
                dataIndex: "name"
              },
              {
                title: "属性值",
                dataIndex: "value",
                render: text => (text && text.length>50?<Popover
                  content={text}
                  style={{
                    width: "700px",
                    wordWrap: "break-word",
                    wordBreak: "break-all"
                  }}
                  trigger="hover"
                >
                  <span>{text.substr(0, 50) + "..."}</span>
                </Popover>:text)
              }
            ]}
            dataSource={this.state.compositeDataList}
            pagination={false}
          />
        </Modal>
      </div>
    );
  }
}

export default Domain;
