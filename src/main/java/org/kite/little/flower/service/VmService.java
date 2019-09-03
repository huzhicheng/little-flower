package org.kite.little.flower.service;

import com.sun.tools.attach.AgentInitializationException;
import com.sun.tools.attach.AgentLoadException;
import com.sun.tools.attach.VirtualMachine;
import com.sun.tools.attach.VirtualMachineDescriptor;
import org.kite.little.flower.config.JmxConnectorInstance;
import org.kite.little.flower.dto.Vm;
import org.springframework.stereotype.Service;
import sun.management.ConnectorAddressLink;

import javax.management.remote.JMXConnector;
import javax.management.remote.JMXConnectorFactory;
import javax.management.remote.JMXServiceURL;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

/**
 * VmService
 *
 * @author fengzheng
 * @date 2019/8/27
 */
@Service
public class VmService {

    public List<Vm> getLocalJvm() {
        List<Vm> jvms = new ArrayList<>();
        List<VirtualMachineDescriptor> virtualMachines = VirtualMachine.list();
        for (VirtualMachineDescriptor virtualMachineDescriptor : virtualMachines) {
            Vm jvm = new Vm();
            jvm.setPid(Integer.valueOf(virtualMachineDescriptor.id()));
            jvm.setName(virtualMachineDescriptor.displayName().split(" ")[0]);
            jvms.add(jvm);
        }
        return jvms;
    }

    public void attachJvm(int pid) throws Exception {
        JMXServiceURL jmxServiceURL = null;

        String address = ConnectorAddressLink.importFrom(pid);
        if(address==null) {
            VirtualMachine virtualMachine = VirtualMachine.attach(Integer.toString(pid));
            //加载Agent
            String javaHome = virtualMachine.getSystemProperties().getProperty("java.home");
            String agentPath = javaHome + File.separator + "jre" + File.separator + "lib" + File.separator + "management-agent.jar";
            File file = new File(agentPath);
            if (!file.exists()) {
                agentPath = javaHome + File.separator + "lib" + File.separator + "management-agent.jar";
                file = new File(agentPath);
                if (!file.exists()) {
                    throw new IOException("Management agent not found");
                }
            }
            agentPath = file.getCanonicalPath();
            try {
                virtualMachine.loadAgent(agentPath, "com.sun.management.jmxremote");
            } catch (AgentLoadException e) {
                throw new IOException(e);
            } catch (AgentInitializationException agentinitializationexception) {
                throw new IOException(agentinitializationexception);
            }

            Properties properties = virtualMachine.getAgentProperties();

            address = (String) properties.get("com.sun.management.jmxremote.localConnectorAddress");
            if (address != null) {
                jmxServiceURL = new JMXServiceURL(address);
            }
        }else{
            jmxServiceURL = new JMXServiceURL(address);
        }
        JMXConnector jmxConnector = JMXConnectorFactory.connect(jmxServiceURL, null);
        JmxConnectorInstance.INSTANCE.setJmxConnector(jmxConnector);
    }

    public void attachRemoteJvm(String host,String port) throws Exception{

        String jmxUrl =  String.format("service:jmx:rmi:///jndi/rmi://%s:%s/jmxrmi",host,port);
        JMXServiceURL jmxServiceURL = new JMXServiceURL(jmxUrl);
        JMXConnector jmxConnector = JMXConnectorFactory.connect(jmxServiceURL, null);
        JmxConnectorInstance.INSTANCE.setJmxConnector(jmxConnector);
    }
}
