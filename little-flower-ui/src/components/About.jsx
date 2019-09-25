import React from "react";
import { Breadcrumb, Row, Col, Icon, Card } from "antd";
import GitHubButton from 'react-github-btn';
import "../styles/style.scss";
import wechat from "../asset/qrcode.png";

const { Meta } = Card;

export default class About extends React.Component {
  render() {
    return (
      <div className="about">
        <Breadcrumb style={{ marginTop: "-10px", paddingBottom: "10px" }}>
          <Breadcrumb.Item>JMX</Breadcrumb.Item>
          <Breadcrumb.Item>关于</Breadcrumb.Item>
        </Breadcrumb>
        <Row gutter={16}>
          <Col span={6}>
            <Card
              hoverable
              style={{ width: 260 }}
              cover={<img alt="微信公众号：古时的风筝" src={wechat} />}
            >
              <Meta
                avatar={<Icon style={{ color: "#44b549" }} type="wechat" />}
                title="古时的风筝"
                description="不只有技术的技术公众号"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card
              hoverable
              style={{ width: 260 }}
              cover={<img alt="微信公众号：古时的风筝" src={wechat} />}
            >
              <Meta
                avatar={<Icon type="github" />}
                title="古时的风筝"
                description={<GitHubButton size="large" href="https://github.com/huzhicheng/little-flower" data-icon="octicon-star" aria-label="Star huzhicheng/little-flower on GitHub">Star</GitHubButton>}
              />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
}
