# little-flower （小花儿）
一个简单的 web 版 JVM 监控器(只测试过连接 HotSpot ,JDK 8)

![Java](https://img.shields.io/badge/JDK-1.8-green.svg) [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.6.16-brightgreen.svg)](https://spring.io/projects/spring-boot) [![wechat](https://img.shields.io/badge/公众号-古时的风筝-success.svg)]()

以 JMX 技术为基础，差不多实现了一个 web 版的 visualVM，具备以下功能：
- 支持连接本地 JVM 和 远程 JVM 
- 展示所有 MBeans，并可查看属性及调用操作
- 仪表盘功能：
    - 实时系统信息，系统 CPU 使用率、内存占用等
    - JVM 参数信息
    - 实时 CPU 使用率曲线图、实时 Heap 、MetaSpace 使用量曲线图、实时类加载量曲线图、实时线程数曲线图
    - 垃圾收集器及垃圾收集次数

  ![](https://github.com/huzhicheng/little-flower/raw/master/Jvm-Monitor.png?raw=true)
  
### 技术架构

服务端： Java 1.8 + Spring Boot 2.6.16 + jmxtools

### 仅后端运行方式

当前分支版本中，已经将最新版编译好的前端代码放到 Spring Boot 项目 resource/public 目录下，所以简单的
运行方式是直接运行 Spring Boot 项目。

项目设置的端口是 6002，并且设置了相对路径 `jmx`。

正常启动项目后，在浏览器打开 http://localhost:6002/jmx/ ，即可使用。

1. 前端启动成功后，在浏览器访问 http://localhost:3000/jmx，注意相对路径 `/jmx`，这是在项目路由中设置的。
2. 在页面右侧会出现当前机器已启动的 JVM 进程；

    ![](https://hexo.moonkite.cn/blog/20231018173808.png)

3. 点击任意一个 JVM 后面的「连接」按钮，即可监控此 JVM ，可切换 tab 查看系统信息、JVM 信息、试试监控图表、垃圾收集信息，以及 domains 信息

    ![](https://hexo.moonkite.cn/blog/20231018174102.png)

    ![](https://hexo.moonkite.cn/blog/20231018174416.png)

    
### 前后端运行方式
前端代码在 [另外一个仓库中](https://github.com/huzhicheng/VisualVM-Web)，使用方式可查看此仓库。



![](https://github.com/huzhicheng/little-flower/blob/master/little-flower-ui/src/asset/qrcode.png?raw=true)