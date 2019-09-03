const baseUrl =
  process.env.NODE_ENV === "development" ? "http://localhost:6002" : "";

export default {
  getDomains: `${baseUrl}/jmx/bean/domains`,
  getProperties: `${baseUrl}/jmx/bean/properties`,
  invokeMethod: `${baseUrl}/jmx/bean/run`,
  overview: `${baseUrl}/jmx/dashboard/overview`,
  getLocalJvms: `${baseUrl}/jmx/vm/localJvms`,
  attachLocalJvm: `${baseUrl}/jmx/vm/attachLocalJvm`,
  attachRemoteJvm: `${baseUrl}/jmx/vm/attachRemoteJvm`,
};
