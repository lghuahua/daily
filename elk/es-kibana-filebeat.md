本次采用docker-compose部署elasticsearch和kibana, docker-compose.yml配置如下
```bash
version: '3'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.8.0
    container_name: elasticsearch
    hostname: elasticsearch
    environment:
      # 节点配置, 注意多个elasticsearch节点时的配置
      # - node.name=es03
      # - discovery.seed_hosts=es01,es02
      # - cluster.initial_master_nodes=es01,es02,es03
      - node.name=elasticsearch
      - cluster.name=es-docker-cluster
      - discovery.seed_hosts=elasticsearch
      - cluster.initial_master_nodes=elasticsearch
      - bootstrap.memory_lock=true
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - you_elasticsearch_config_path/data:/usr/share/elasticsearch/data
    ports:
      - 9200:9200
    networks:
      - esnet

  kibana:
    image: docker.elastic.co/kibana/kibana:7.8.0
    container_name: kibana
    ports:
      - 5601:5601
    environment:
    # elastic服务地址
      - ELASTICSEARCH_URL=http://elasticsearch:9200
    networks:
      - esnet
    volumes:
      - you_kibana_config_path/kibana.yml:/usr/share/kibana/config/kibana.yml
# 网络配置
networks:
  esnet:
    driver: bridge
```

## 安装使用elastic
采用docker 安装
```bash
docker pull docker.elastic.co/elasticsearch/elasticsearch:7.8.1
```
在启动前需要修改 vm.max_map_count 需要至少设置262144才能够使用, 不同的操作系统配置方式不同
- Linux
可以在/etc/sysctl.conf 中增加该配置

ingest node
 elastic ingest node的使用可以看 [官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/7.8/ingest.html)
 可以通过api来管理ingest node 也可以在kibana的ingest Node Pipelines管理界面来管理

## 安装使用kibana
docker安装
```bash
docker pull docker.elastic.co/kibana/kibana:7.8.1
```
在kibana.yml 中指定elasticsearch服务地址

### 自定义pipeline
在kibana中配置pipeline 可参考[官方文档](https://www.elastic.co/guide/en/kibana/current/ingest-node-pipelines.html)
在kibana管理界面,打开stack Management,找到ingest Node Pipelines.就可以创建自己的pipeline 来处理自己的日志格式.
新版本的filebeat提供了同logstash中的 grok的功能,可以用来过滤出日志记录中想要的信息.
在ingest Node Pipelines的管理界面提供了测试功能,可以测试自定义的pipeline.

## 安装使用filebeat
1. deb
```bash
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.8.1-amd64.deb
sudo dpkg -i filebeat-7.8.1-amd64.deb
```
2. rpm
```bash
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.8.1-x86_64.rpm
sudo rpm -vi filebeat-7.8.1-x86_64.rpm
```
3. linux
```bash
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-7.8.1-linux-x86_64.tar.gz
tar xzvf filebeat-7.8.1-linux-x86_64.tar.gz
```
4. docker
```bash
docker pull docker.elastic.co/beats/filebeat:7.8.1
```

### 配置和启动filebeat
在 /etc/filebeat 文件夹下可以找到filebeat的配置文件 filebeat.yml
1. 配置input
可以配置多个输入,相同类型的输入可以有多个. 例如:
```bash
# https://www.elastic.co/guide/en/beats/filebeat/current/configuration-filebeat-options.html
filebeat.inputs:
- type: log
  # paths 指定日志文件所在位置
  paths:
    - /var/log/system.log
    - /var/log/wifi.log
- type: log
  paths:
    - "/var/log/apache2/*"
  fields:
    apache: true
  fields_under_root: true
```
filebeat有 Kafka、Log、Redis、S3等多中输入类型。

多行配置用于处理跨越多行的日志信息, [多行配置](https://www.elastic.co/guide/en/beats/filebeat/current/multiline-examples.html)
```bash
  multiline.pattern: 'Started\s(POST|GET|PUT|PATCH|DELETE|OPTIONS)'
  multiline.negate: true
  multiline.match: after
  multiline.flush_pattern: '/Completed\s\d.*?\(*?\)$/'
```

2. 模块配置
配置可用模块的路径, 可用使用命令启用模块
```bash
filebeat modules enable system nginx mysql
```
查看可用的模块
```bash
filebeat modules list
```
在配置文件中指定模块所在路径
```bash
filebeat.config.modules:
  # Glob pattern for configuration loading
  path: ${path.config}/modules.d/*.yml
  reload.enabled: false
```

3. index 模板配置
如果使用默认索引模板则不需要进行修改.
使用不同的模板
```bash
setup.template.name: "your_template_name"
setup.template.fields: "path/to/fields.yml"
# 设置为true会覆盖已经存在的同名模板
setup.template.overwrite: true
# 自动加载模板,如果设置为false 则需要手动加载  https://www.elastic.co/guide/en/beats/filebeat/current/filebeat-template.html#load-template-manually
setup.template.enabled: false
setup.template.pattern: "your_template_name-*"
```
如果您使用的是内置的Kibana仪表板，请同时设置setup.dashboards.index选项
```bash
setup.dashboards.index: "customname-*"
```

注意: (我在使用自定义模板时 需要关闭索引生命周期才能生效)
```bash
setup.ilm.enabled: false
```

4. 配置输出
配置elasticsearch服务地址
```bash
output.elasticsearch:
  hosts: ["myEShost:9200"]

  index: "your_template_name-${FILEBEAT_ENV}-*"
  pipeline: "you_pipeline_name"
  # 多索引配置,可以将不同的日志发送到不同的索引
  indices:
    - index: "you_pipeline_name-${FILEBEAT_ENV}-%{+yyyy.MM.dd}"
      when.equals:
        fields:
          apache: true

```

5. 配置kibana服务地址
```bash
setup.kibana:
  host: '${KIBANA_HOST}'
```

6. filebeat日志配置
```bash
logging.level: info   # 日志等级
logging.to_files: true  # 为true时会将日志输出到下边指定的文件
logging.files:
  path: /var/log/filebeat  # 日志文件路径
  name: filebeat  # 日志文件名
  keepfiles: 3  # 保留日志文件个数
```
7. 启动filebeat
启动并初始化环境
```bash
filebeat setup -e
```
启动filebeat
```bash
filebeat -e
# 如果使用service管理服务
service filebeat start
```
在filebeat.yml 中可以使用[环境变量](https://www.elastic.co/guide/en/beats/filebeat/current/using-environ-vars.html)

| Config source | Environment setting | Config after replacement |
| --- | --- | --- |
| name: ${NAME} | export NAME=elastic | name: elastic |
| name: ${NAME} | no setting | name: |
| name: ${NAME:beats} | no setting | name: beats |
| name: ${NAME:beats} | export NAME=elastic | name: elastic |
| name: ${NAME:?You need to set the NAME environment variable} | no setting | None. Returns an error message that’s prepended with the custom text. |
| name: ${NAME:?You need to set the NAME environment variable} | export NAME=elastic | name: elastic |