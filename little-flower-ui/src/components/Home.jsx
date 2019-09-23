import React, { Component } from "react";
import {
  Chart,
  Geom,
  Axis,
  Tooltip,
  Legend,
} from "bizcharts";
import {
  Tabs,
  Row,
  Col,
  Statistic,
  List,
  Typography,
  Icon,
  Tag
} from "antd";
import { observer, inject } from "mobx-react";
import { api, getData } from "../request";
import "../styles/style.scss";

const { TabPane } = Tabs;

const garbageCollector = {
  Copy: "Serial",
  "PS Scavenge": "Parallel Scavenge",
  ParNew: "ParNew",
  "G1 Young Generation": "G1",
  MarkSweepCompact: "Serial Old",
  "PS MarkSweep": "Parallel Old",
  ConcurrentMarkSweep: "CMS",
  "G1 Old Generation": "G1"
};

@inject("globalStore")
@observer
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      systemInfo: {},
      jvmInfo: {},
      heapMemoryInfo: {},
      metaspaceInfo: {},
      classInfo: {},
      threadInfo: {},
      garbageCollectorInfo: [],
      cpuData: [],
      heapMemoryData: [],
      memaspaceData: [],
      classData: [],
      threadData: [],
      scales: {
        cpu: {
          time: {
            alias: "时间",
            type: "time",
            mask: "HH:mm:ss",
            tickCount: 6,
            nice: false
          },
          load: {
            alias: "使用率",
            min: 5,
            max: 100,
            formatter: text => {
              return `${text.toFixed(2)}%`;
            }
          },
          type: {
            type: "cat"
          }
        },
        heapMemory: {
          time: {
            alias: "时间",
            type: "time",
            mask: "HH:mm:ss",
            tickCount: 6,
            nice: false
          },
          size: {
            alias: "用量",
            // max:1000000000,
            // min:5,
            formatter: text => {
              return `${text.toFixed(2)}M`;
            }
          },
          type: {
            type: "cat"
          }
        },
        class: {
          time: {
            alias: "时间",
            type: "time",
            mask: "HH:mm:ss",
            tickCount: 6,
            nice: false
          },
          size: {
            alias: "数量",
            // max:1000000000,
            min: 0,
            formatter: text => {
              return `${text}`;
            }
          },
          type: {
            type: "cat"
          }
        }
      }
    };
  }

  componentDidMount() {
      this.loadData();
  }

  loadData = () => {
    const me = this;
    setInterval(() => {
      if(this.props.globalStore.isAttachJvm){
      getData(api.overview, {}).then(res => {
        if (res.success) {
          me.setState({
            systemInfo: res.data.systemInfo,
            jvmInfo: res.data.jvmInfo,
            heapMemoryInfo: res.data.heapMemoryUsage,
            metaspaceInfo: res.data.metaSpace,
            classInfo: res.data.classLoadingInfo,
            threadInfo: res.data.threadInfo,
            garbageCollectorInfo: res.data.garbageCollectorInfo
          });
          me.buildCpuData();
          me.buildHeapMemoryData();
          me.buildMetaspaceData();
          me.buildClassData();
          me.buildThreadData();
        }
      });
    }
    }, 2000);
  };

  /**
   * 构造 cpu 曲线
   */
  buildCpuData = () => {
    let cpuData = this.state.cpuData;
    if (cpuData.length >= 100) {
      cpuData.shift();
      cpuData.shift();
    }
    const cpuInfo = this.state.systemInfo;
    var now = new Date();
    var time = now.getTime();
    cpuData.push({
      time: time,
      load: cpuInfo.systemCpuLoad * 100,
      type: "系统 CPU 使用率"
    });
    cpuData.push({
      time: time,
      load: cpuInfo.processCpuLoad * 100,
      type: "当前 jvm CPU 使用率"
    });
    this.setState({
      cpuData: cpuData
    });
  };

  /**
   * 构造 heapMemoryUsage 曲线
   */
  buildHeapMemoryData = () => {
    let heapMemoryData = this.state.heapMemoryData;
    if (heapMemoryData.length >= 200) {
      heapMemoryData.shift();
      heapMemoryData.shift();
    }

    const heapMemoryInfo = this.state.heapMemoryInfo;
    var now = new Date();
    var time = now.getTime();
    heapMemoryData.push({
      time: time,
      size: heapMemoryInfo.committed / 1024 / 1024,
      type: "Heap 大小"
    });
    heapMemoryData.push({
      time: time,
      size: heapMemoryInfo.used / 1024 / 1024,
      type: "Heap 使用量"
    });
    this.setState({
      heapMemoryData: heapMemoryData
    });
  };

  /**
   * 构造 MetaspaceUsage 曲线
   */
  buildMetaspaceData = () => {
    let memaspaceData = this.state.memaspaceData;
    if (memaspaceData.length >= 200) {
      memaspaceData.shift();
      memaspaceData.shift();
    }

    const metaspaceInfo = this.state.metaspaceInfo;
    var now = new Date();
    var time = now.getTime();
    memaspaceData.push({
      time: time,
      size: metaspaceInfo.committed / 1024 / 1024,
      type: "metaspace 大小"
    });
    memaspaceData.push({
      time: time,
      size: metaspaceInfo.used / 1024 / 1024,
      type: "metaspace 使用量"
    });
    this.setState({
      memaspaceData: memaspaceData
    });
  };

  /**
   * 构造 classes 曲线
   */
  buildClassData = () => {
    let classData = this.state.classData;
    if (classData.length >= 200) {
      classData.shift();
      classData.shift();
    }

    const classInfo = this.state.classInfo;
    var now = new Date();
    var time = now.getTime();
    // classData.push({
    //   time: time,
    //   size: classInfo.totalLoadedClassCount,
    //   type: "总数"
    // });
    classData.push({
      time: time,
      size: classInfo.loadedClassCount,
      type: "已加载类"
    });
    classData.push({
      time: time,
      size: classInfo.unloadedClassCount,
      type: "未加载类"
    });
    this.setState({
      classData: classData
    });
  };

  /**
   * 构造 thread 曲线
   */
  buildThreadData = () => {
    let threadData = this.state.threadData;
    if (threadData.length >= 200) {
      threadData.shift();
      threadData.shift();
    }

    const threadInfo = this.state.threadInfo;
    var now = new Date();
    var time = now.getTime();
    threadData.push({
      time: time,
      size: threadInfo.liveThreadCount,
      type: "活动线程"
    });
    threadData.push({
      time: time,
      size: threadInfo.daemonThreadCount,
      type: "守护线程"
    });

    this.setState({
      threadData: threadData
    });
  };

  render() {
    const {
      systemInfo,
      jvmInfo,
      cpuData,
      heapMemoryData,
      memaspaceData,
      classData,
      threadData
    } = this.state;
    const inputArgs = jvmInfo.inputArguments || [];
    const systemProperties = jvmInfo.systemProperties || [];
    return (
      <div className="home">
        <Tabs type="card">
          <TabPane tab="系统信息" key="1">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic title="系统名称" value={systemInfo.name} />
              </Col>
              <Col span={6}>
                <Statistic title="系统架构" value={systemInfo.arch} />
              </Col>
              <Col span={6}>
                <Statistic title="系统版本" value={systemInfo.version} />
              </Col>
              <Col span={6}>
                <Statistic
                  title="可用处理器个数"
                  value={systemInfo.availableProcessors}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="物理内存 (G)"
                  value={
                    systemInfo.totalPhysicalMemorySize / 1024 / 1024 / 1024
                  }
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="系统 CPU 使用"
                  value={systemInfo.systemCpuLoad * 100}
                  suffix="%"
                  precision={2}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="当前 JVM CPU 使用率"
                  value={systemInfo.processCpuLoad * 100}
                  suffix="%"
                  precision={2}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="最后一分钟 CPU 平均负载"
                  value={systemInfo.systemLoadAverage}
                  precision={2}
                />
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="已提交内存(MB)"
                  value={systemInfo.committedVirtualMemorySize / 1024 / 1024}
                  precision={2}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="空闲内存 (MB)"
                  value={systemInfo.freePhysicalMemorySize / 1024 / 1024}
                  precision={2}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="交换内存空间 (MB)"
                  value={systemInfo.totalSwapSpaceSize / 1024 / 1024}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="空闲交换空间 (MB)"
                  value={systemInfo.freeSwapSpaceSize / 1024 / 1024}
                  precision={2}
                />
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="JVM 信息" key="2">
            <Row gutter={16}>
              <Col span={12}>
                <List
                  bordered
                  dataSource={inputArgs}
                  renderItem={item => (
                    <List.Item>
                      <Typography.Text mark>
                        <Icon type="tag" />
                      </Typography.Text>{" "}
                      {item}
                    </List.Item>
                  )}
                />
              </Col>

              <Col span={12}>
                <List
                  bordered
                  dataSource={systemProperties}
                  renderItem={item => (
                    <List.Item>
                      {/* <List.Item.Meta
                        title={item.name}
                        description={item.value}
                      /> */}
                      {item.name}={item.value}
                    </List.Item>
                  )}
                />
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="实时监控" key="3">
            <Row gutter={16}>
              <Col span={12}>
                <Tabs defaultActiveKey="1">
                  <TabPane tab="CPU" key="1">
                    <div className="chart-header">
                      <Tag color="#108ee9">
                        系统 CPU: {(systemInfo.systemCpuLoad * 100).toFixed(2)}%
                      </Tag>

                      <Tag color="#108ee9">
                        JVM CPU: {(systemInfo.processCpuLoad * 100).toFixed(2)}%
                      </Tag>
                    </div>
                    <Chart
                      height={400}
                      data={cpuData}
                      scale={this.state.scales.cpu}
                      forceFit
                      onGetG2Instance={g2Chart => {}}
                    >
                      <Tooltip />
                      {cpuData.length !== 0 ? <Axis /> : ""}
                      <Legend />
                      <Geom
                        type="line"
                        position="time*load"
                        color={["type", ["#ff7f0e", "#2ca02c"]]}
                        shape="smooth"
                        size={2}
                      />
                    </Chart>
                  </TabPane>
                </Tabs>
              </Col>

              <Col span={12}>
                <Tabs defaultActiveKey="1">
                  <TabPane tab="Heap" key="1">
                    <div className="chart-header">
                      <Tag color="#108ee9">
                        max:
                        {(this.state.heapMemoryInfo.max / 1024 / 1024).toFixed(
                          2
                        )}
                        M
                      </Tag>
                      <Tag color="#108ee9">
                        init:
                        {(this.state.heapMemoryInfo.init / 1024 / 1024).toFixed(
                          2
                        )}
                        M
                      </Tag>

                      <Tag color="#108ee9">
                        committed:
                        {(
                          this.state.heapMemoryInfo.committed /
                          1024 /
                          1024
                        ).toFixed(2)}
                        M
                      </Tag>
                      <Tag color="#108ee9">
                        used:
                        {(this.state.heapMemoryInfo.used / 1024 / 1024).toFixed(
                          2
                        )}
                        M
                      </Tag>
                    </div>
                    <Chart
                      height={400}
                      data={heapMemoryData}
                      scale={this.state.scales.heapMemory}
                      forceFit
                      onGetG2Instance={g2Chart => {}}
                    >
                      <Tooltip />
                      {heapMemoryData.length !== 0 ? <Axis /> : ""}
                      <Legend />
                      <Geom
                        type="line"
                        position="time*size"
                        color={["type", ["#ff7f0e", "#2ca02c"]]}
                        shape="smooth"
                        size={2}
                      />
                    </Chart>
                  </TabPane>

                  <TabPane tab="Metaspace" key="2">
                    <div className="chart-header">
                      <Tag color="#108ee9">
                        init:
                        {(this.state.metaspaceInfo.init / 1024 / 1024).toFixed(
                          2
                        )}
                        M
                      </Tag>

                      <Tag color="#108ee9">
                        committed:
                        {(
                          this.state.metaspaceInfo.committed /
                          1024 /
                          1024
                        ).toFixed(2)}
                        M
                      </Tag>
                      <Tag color="#108ee9">
                        used:
                        {(this.state.metaspaceInfo.used / 1024 / 1024).toFixed(
                          2
                        )}
                        M
                      </Tag>
                    </div>
                    <Chart
                      height={400}
                      data={memaspaceData}
                      scale={this.state.scales.heapMemory}
                      forceFit
                      onGetG2Instance={g2Chart => {}}
                    >
                      <Tooltip />
                      {memaspaceData.length !== 0 ? <Axis /> : ""}
                      <Legend />
                      <Geom
                        type="line"
                        position="time*size"
                        color={["type", ["#ff7f0e", "#2ca02c"]]}
                        shape="smooth"
                        size={2}
                      />
                    </Chart>
                  </TabPane>
                </Tabs>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Tabs defaultActiveKey="1">
                  <TabPane tab="类加载" key="1">
                    <div className="chart-header">
                      <Tag color="#108ee9">
                        总数: {this.state.classInfo.totalLoadedClassCount}
                      </Tag>

                      <Tag color="#108ee9">
                        已加载类: {this.state.classInfo.loadedClassCount}
                      </Tag>

                      <Tag color="#108ee9">
                        未加载类: {this.state.classInfo.unloadedClassCount}
                      </Tag>
                    </div>
                    <Chart
                      height={400}
                      data={classData}
                      scale={this.state.scales.class}
                      forceFit
                      onGetG2Instance={g2Chart => {}}
                    >
                      <Tooltip />
                      {classData.length !== 0 ? <Axis /> : ""}
                      <Legend />
                      <Geom
                        type="line"
                        position="time*size"
                        color={["type", ["#ff7f0e", "#2ca02c"]]}
                        shape="smooth"
                        size={2}
                      />
                    </Chart>
                  </TabPane>
                </Tabs>
              </Col>

              <Col span={12}>
                <Tabs defaultActiveKey="1">
                  <TabPane tab="线程" key="1">
                    <div className="chart-header">
                      <Tag color="#108ee9">
                        total started:{" "}
                        {this.state.threadInfo.totalStartedThreadCount}
                      </Tag>

                      <Tag color="#108ee9">
                        活动线程: {this.state.threadInfo.liveThreadCount}
                      </Tag>

                      <Tag color="#108ee9">
                        活动线程峰值:{" "}
                        {this.state.threadInfo.livePeakThreadCount}
                      </Tag>

                      <Tag color="#108ee9">
                        守护线程数: {this.state.threadInfo.daemonThreadCount}
                      </Tag>
                    </div>
                    <Chart
                      height={400}
                      data={threadData}
                      scale={this.state.scales.class}
                      forceFit
                      onGetG2Instance={g2Chart => {}}
                    >
                      <Tooltip />
                      {threadData.length !== 0 ? <Axis /> : ""}
                      <Legend />
                      <Geom
                        type="line"
                        position="time*size"
                        color={["type", ["#ff7f0e", "#2ca02c"]]}
                        shape="smooth"
                        size={2}
                      />
                    </Chart>
                  </TabPane>
                </Tabs>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="垃圾收集器" key="4">
            {this.state.garbageCollectorInfo.map(item => {
              return (
                <Tag key={item.name} color="#108ee9">
                  {item.name}({garbageCollector[item.name]}) : 已收集{" "}
                  {item.collectionCount} 次
                </Tag>
              );
            })}
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default Home;
