# kafka-js


## Project setup
```
npm install
```

### Run docker-compose for zookeeper and kafka
```
export HOST_IP=$(ifconfig | grep -E "([0-9]{1,3}\.){3}[0-9]{1,3}" | grep -v 127.0.0.1 | awk '{ print $2 }' | cut -f2 -d: | head -n1)

docker-compose up

```


### Run producer
```
node producer.js
```

### Run consumer
```
node  consumer.js
```
