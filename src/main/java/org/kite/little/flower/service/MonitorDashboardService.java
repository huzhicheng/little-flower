package org.kite.little.flower.service;

import org.kite.little.flower.config.JmxConnectorInstance;
import org.kite.little.flower.dto.*;
import org.kite.little.flower.dto.ThreadInfo;
import org.kite.little.flower.utils.EntryUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.management.MBeanServerConnection;
import javax.management.ObjectName;
import javax.management.remote.JMXConnector;
import java.lang.management.*;
import java.util.*;

/**
 * MonitorDashboardService
 * 采集如下几个指标：
 * 1. 内存占用
 * 2. CPU 使用率
 * 3. 线程数量
 * 4. 类加载
 * 5. 操作系统信息 通过 OperatingSystemMXBean 或者直接查询 java.lang:type=OperatingSystem
 * 6. jvm 信息 通过 RuntimeMXBean 或者直接查询 java.lang:type=Runtime
 * 7. 垃圾收集器
 *
 * @author fengzheng
 * @date 2019/8/6
 */
@Service(value = "monitorDashboardService")
public class MonitorDashboardService {

    @Autowired
    private JmxService jmxService;

    public Overview overview() {
        OperatingSystemMXBean operatingSystemMXBean = ManagementFactory.getOperatingSystemMXBean();
        RuntimeMXBean runtimeMXBean = ManagementFactory.getRuntimeMXBean();
        ObjectName systemBeanObjectName = operatingSystemMXBean.getObjectName();
        BeanInfo systemBean = jmxService.getObjectNameProperties(systemBeanObjectName.getCanonicalName());
        BeanInfo jvmBean = jmxService.getObjectNameProperties(runtimeMXBean.getObjectName().getCanonicalName());

        Overview overview = new Overview();
        SystemInfo systemInfo = buildSystemInfo(systemBean);
        JvmInfo jvmInfo = buildJvmInfo(jvmBean);
        overview.setSystemInfo(systemInfo);
        overview.setJvmInfo(jvmInfo);
        buildMemoryInfo(overview);
        MetaSpace metaSpace = buildMetaspace();
        overview.setMetaSpace(metaSpace);
        ThreadInfo threadInfo = buildThreadInfo();
        overview.setThreadInfo(threadInfo);

        ClassLoadingInfo classLoadingInfo = buildClassInfo();
        overview.setClassLoadingInfo(classLoadingInfo);
        try {
            List<GarbageInfo> garbageInfos = buildGarbageCollectorInfo();
            overview.setGarbageCollectorInfo(garbageInfos);
        } catch (Exception e) {

        }

        return overview;

    }

    /**
     * 系统参数
     *
     * @param systemBean
     * @return
     */
    private SystemInfo buildSystemInfo(BeanInfo systemBean) {
        List<BeanAttributeInfo> attributeInfos = systemBean.getBeanAttributeInfos();
        SystemInfo systemInfo = new SystemInfo();
        for (BeanAttributeInfo beanAttributeInfo : attributeInfos) {
            String name = beanAttributeInfo.getName();
            String firstCharLowerCase = name.substring(0, 1).toLowerCase();
            name = name.replaceFirst("[A-Z]{1}", firstCharLowerCase);
            EntryUtil.setValue(systemInfo, name, beanAttributeInfo.getValue().getData());
        }
        return systemInfo;
    }

    /**
     * jvm 参数
     *
     * @param runtimeBean
     * @return
     */
    private JvmInfo buildJvmInfo(BeanInfo runtimeBean) {
        List<BeanAttributeInfo> attributeInfos = runtimeBean.getBeanAttributeInfos();
        JvmInfo jvmInfo = new JvmInfo();
        for (BeanAttributeInfo beanAttributeInfo : attributeInfos) {
            String name = beanAttributeInfo.getName();
            String firstCharLowerCase = name.substring(0, 1).toLowerCase();
            name = name.replaceFirst("[A-Z]{1}", firstCharLowerCase);
            if (!name.equals("systemProperties")) {
                jvmInfo = EntryUtil.setValue(jvmInfo, name, beanAttributeInfo.getValue().getData());
            } else {
                /**
                 * systemProperties 格式特殊 需要单独处理
                 */
                List<TreeMap<String, Object>> properties = (ArrayList) beanAttributeInfo.getValue().getData();
                jvmInfo.setSystemProperties(properties);
            }
        }
        return jvmInfo;
    }


    private static final String HEAP_MEMORY = "HeapMemoryUsage";

    private static final String NON_HEAP_MEMORY = "NonHeapMemoryUsage";

    /**
     * jvm 内存信息 堆和非堆
     *
     * @param overview
     */
    private void buildMemoryInfo(Overview overview) {
        MemoryMXBean memoryMXBean = ManagementFactory.getMemoryMXBean();
        BeanInfo beanInfo = jmxService.getObjectNameProperties(memoryMXBean.getObjectName().getCanonicalName());
        List<BeanAttributeInfo> beanAttributeInfos = beanInfo.getBeanAttributeInfos();
        for (BeanAttributeInfo beanAttributeInfo : beanAttributeInfos) {
            if (beanAttributeInfo.getName().equals(HEAP_MEMORY)) {
                overview.setHeapMemoryUsage(buildMemoryUsage(beanAttributeInfo));
            } else if (beanAttributeInfo.getName().equals(NON_HEAP_MEMORY)) {
                overview.setNonHeapMemoryUsage(buildMemoryUsage(beanAttributeInfo));
            }
        }
    }

    private MemoryUsage buildMemoryUsage(BeanAttributeInfo beanAttributeInfo) {
        SortedMap<String, Object> map = (TreeMap<String, Object>) beanAttributeInfo.getValue().getData();
        long init = Long.valueOf(map.get("init").toString());
        long used = Long.valueOf(map.get("used").toString());
        long committed = Long.valueOf(map.get("committed").toString());
        long max = Long.valueOf(map.get("max").toString());
        MemoryUsage memoryUsage = new MemoryUsage(init, used, committed, max);
        return memoryUsage;
    }

    /**
     * Metaspace 元空间信息
     */
    private MetaSpace buildMetaspace() {
        MetaSpace metaSpace = new MetaSpace();
        BeanInfo beanInfo = jmxService.getObjectNameProperties("java.lang:name=Metaspace,type=MemoryPool");
        List<BeanAttributeInfo> beanAttributeInfos = beanInfo.getBeanAttributeInfos();
        for (BeanAttributeInfo attributeInfo : beanAttributeInfos) {
            if (attributeInfo.getName().equals("Usage")) {
                TreeMap<String, Object> usageMap = (TreeMap<String, Object>) attributeInfo.getValue().getData();
                metaSpace.setCommitted((long) usageMap.get("committed"));
                metaSpace.setInit((long) usageMap.get("init"));
                metaSpace.setMax((long) usageMap.get("max"));
                metaSpace.setUsed((long) usageMap.get("used"));
                return metaSpace;
            }
        }
        return null;
    }

    /**
     * 线程信息
     *
     * @return
     */
    private ThreadInfo buildThreadInfo() {
        ThreadInfo threadInfo = new ThreadInfo();
        ThreadMXBean threadMXBean = ManagementFactory.getThreadMXBean();
        BeanInfo beanInfo = jmxService.getObjectNameProperties(threadMXBean.getObjectName().getCanonicalName());
        List<BeanAttributeInfo> beanAttributeInfos = beanInfo.getBeanAttributeInfos();
        for (BeanAttributeInfo beanAttributeInfo : beanAttributeInfos) {

            if (beanAttributeInfo.getName().equals("ThreadCount")) {
                threadInfo.setLiveThreadCount((int) beanAttributeInfo.getValue().getData());
            } else if (beanAttributeInfo.getName().equals("DaemonThreadCount")) {
                threadInfo.setDaemonThreadCount((int) beanAttributeInfo.getValue().getData());
            } else if (beanAttributeInfo.getName().equals("TotalStartedThreadCount")) {
                threadInfo.setTotalStartedThreadCount((long) beanAttributeInfo.getValue().getData());
            } else if (beanAttributeInfo.getName().equals("PeakThreadCount")) {
                threadInfo.setLivePeakThreadCount((int) beanAttributeInfo.getValue().getData());
            }
        }
        return threadInfo;
    }

    /**
     * class 信息
     *
     * @return
     */
    private ClassLoadingInfo buildClassInfo() {
        ClassLoadingInfo classLoadingInfo = new ClassLoadingInfo();
        ClassLoadingMXBean classLoadingMXBean = ManagementFactory.getClassLoadingMXBean();
        BeanInfo beanInfo = jmxService.getObjectNameProperties(classLoadingMXBean.getObjectName().getCanonicalName());
        List<BeanAttributeInfo> beanAttributeInfos = beanInfo.getBeanAttributeInfos();
        for (BeanAttributeInfo beanAttributeInfo : beanAttributeInfos) {
            if (beanAttributeInfo.getName().equals("TotalLoadedClassCount")) {
                classLoadingInfo.setTotalLoadedClassCount((long) beanAttributeInfo.getValue().getData());
            } else if (beanAttributeInfo.getName().equals("LoadedClassCount")) {
                classLoadingInfo.setLoadedClassCount((int) beanAttributeInfo.getValue().getData());
            } else if (beanAttributeInfo.getName().equals("UnloadedClassCount")) {
                classLoadingInfo.setUnloadedClassCount((long) beanAttributeInfo.getValue().getData());
            }
        }
        return classLoadingInfo;
    }

    /**
     * 垃圾收集器信息
     */
    private List<GarbageInfo> buildGarbageCollectorInfo() throws Exception {
       List<GarbageInfo> garbageInfos = new ArrayList<>();
        JmxConnectorInstance commonConfig = JmxConnectorInstance.INSTANCE;
        JMXConnector connector = commonConfig.getJmxConnector();

        ObjectName queryObjectName = new ObjectName("java.lang:name=*,type=GarbageCollector");
        MBeanServerConnection msc = connector.getMBeanServerConnection();
        Set<ObjectName> objectNames = msc.queryNames(queryObjectName, null);
        for (ObjectName objectName : objectNames) {
            BeanInfo beanInfo = jmxService.getObjectNameProperties(objectName.getCanonicalName());
            List<BeanAttributeInfo> beanAttributeInfos = beanInfo.getBeanAttributeInfos();
            GarbageInfo garbageInfo = new GarbageInfo();
            for (BeanAttributeInfo beanAttributeInfo : beanAttributeInfos) {
                if (beanAttributeInfo.getName().equals("Name")) {
                    garbageInfo.setName(beanAttributeInfo.getValue().getData().toString());
                } else if (beanAttributeInfo.getName().equals("CollectionCount")) {
                    garbageInfo.setCollectionCount((long) beanAttributeInfo.getValue().getData());
                } else if (beanAttributeInfo.getName().equals("MemoryPoolNames")) {
                    String[] pools = (String[]) beanAttributeInfo.getValue().getData();
                    garbageInfo.setMemoryPoolNames(pools);
                }
            }
            garbageInfos.add(garbageInfo);
        }

        return garbageInfos;
    }
}
