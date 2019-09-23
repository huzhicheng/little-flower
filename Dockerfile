FROM openjdk:8

MAINTAINER 古时的风筝

EXPOSE 6002
# 运行 docker run -t -i -p 6002:6002 little-flower:1.0
COPY target/little-flower-1.0-SNAPSHOT.jar /app/
RUN pwd
ENTRYPOINT ["java","-jar","/app/little-flower-1.0-SNAPSHOT.jar"]



