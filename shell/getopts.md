## getopts使用示例

images.sh
```bash
#/bin/bash

help() {
  echo "Usage: ./images.sh [OPTIONS]"
  echo "Options:"
  echo "  -f <镜像名或tag>        过滤条件"
  echo "  -r                      删除镜像"
  exit
}

RM_IMAGE=false
FILTER=''

# getopts optstring 名称 [ arg ...]
# optstring 给出所有选项的字母脚本识别。例如，如果脚本识别-a， -f和-s，则 optstring 为 afs。如果希望在选项字母后跟一个参数值或一组值，请在字母后加一个冒号，如 a：fs
#
#  OPTARG
#    存储由getopts找到的option参数的值。
#  OPTIND
#    包含要处理的下一个参数的索引。

while getopts 'f:rh' OPT; do
  case $OPT in
    f)
      FILTER=$OPTARG;;
    r)
      RM_IMAGE=true;;
    h) help;;
  esac
done

CMD='docker images --format "{{.Repository}}:{{.Tag}}"'

if [ -n "$FILTER" ]; then
  CMD=$CMD" | grep "$FILTER
fi

if $RM_IMAGE; then
  CMD=$CMD" | xargs -t docker image rm"
fi

echo $CMD

```

```
lgh@J6SBFDN:~$ sh images.sh
docker images --format "{{.Repository}}:{{.Tag}}"
lgh@J6SBFDN:~$
lgh@J6SBFDN:~$ sh images.sh -r
docker images --format "{{.Repository}}:{{.Tag}}" | xargs -t docker image rm
lgh@J6SBFDN:~$
lgh@J6SBFDN:~$ sh images.sh -f nginx
docker images --format "{{.Repository}}:{{.Tag}}" | grep nginx
lgh@J6SBFDN:~$
lgh@J6SBFDN:~$ sh images.sh -f nginx -r
docker images --format "{{.Repository}}:{{.Tag}}" | grep nginx | xargs -t docker image rm
lgh@J6SBFDN:~$
lgh@J6SBFDN:~$
lgh@J6SBFDN:~$
lgh@J6SBFDN:~$ sh images.sh -r -f nginx
docker images --format "{{.Repository}}:{{.Tag}}" | grep nginx | xargs -t docker image rm
lgh@J6SBFDN:~$
lgh@J6SBFDN:~$ sh images.sh -rf nginx
docker images --format "{{.Repository}}:{{.Tag}}" | grep nginx | xargs -t docker image rm
lgh@J6SBFDN:~$
lgh@J6SBFDN:~$ sh images.sh -h
Usage: ./images.sh [OPTIONS]
Options:
  -f <镜像名或tag>        过滤条件
  -r                      删除镜像
lgh@J6SBFDN:~$
```
