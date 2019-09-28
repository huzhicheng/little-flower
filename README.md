# little-flower （小花儿）
一个简单的 web 版 JVM 监控器(只测试过连接 HotSpot ,JDK 8)

![Java](https://img.shields.io/badge/JDK-1.8-green.svg) [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.1.7.RELEASE-brightgreen.svg)](https://spring.io/projects/spring-boot) [![wechat](https://img.shields.io/badge/公众号-古时的风筝-success.svg)]()

以 JMX 技术为基础，差不多实现了一个 web 版的 visualVM，具备以下功能：
- 支持连接本地 JVM 和 远程 JVM 
- 展示所有 MBeans，并可查看属性及调用操作
- 仪表盘功能：
    - 实时系统信息，系统 CPU 使用率、内存占用等
    - JVM 参数信息
    - 实时 CPU 使用率曲线图、实时 Heap 、MetaSpace 使用量曲线图、实时类加载量曲线图、实时线程数曲线图
    - 垃圾收集器及垃圾收集次数

![](https://github.com/huzhicheng/little-flower/blob/master/Jvm-Monitor.png?raw=true)
    
### 技术架构
前端： React 16 + Antd + Yarn

服务端： Java 1.8 + Maven

### 仅后端运行方式

当前分支版本中，已经将最新版编译好的前端代码放到 Spring Boot 项目 resource/public 目录下，所以简单的
运行方式是直接运行 Spring Boot 项目后端即可。

    
### 前后端运行方式

一、正常的方式启动后端应用

二、启动前端

由于项目前端采用 React，所以需要再本地安装 Nodejs 环境，并且安装 Yarn 

1. 进入 `little-flower-ui` 目录
2. 安装依赖包，`yarn install` 
3. 启动项目， `yarn start`
4. 打包项目（本地启动不需要这一步）：
   
   **windows 环境**
   
   `set PUBLIC_URL=./ yarn build`
   
   **mac or linux**
   
   `PUBLIC_URL=./ yarn build`
   

***


#### ![](https://img.shields.io/badge/-%E5%BE%AE%E4%BF%A1%E5%85%AC%E4%BC%97%E5%8F%B7-success)   
 关注我的公众号，回复「监控」，获取体验码，体验在线版本

![](https://github.com/huzhicheng/little-flower/blob/master/little-flower-ui/src/asset/qrcode.png?raw=true)