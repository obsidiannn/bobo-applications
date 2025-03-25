import json

def main():
    with open('./template.json', 'r') as f:
        template = json.load(f)
    with open('./config.json', 'r') as fs:
        config = json.load(fs)
    cfg = {
       "api": {
            "listen": config["api"]['port'],
            "routes": []
       },
       "ws": {
            "listen": config["ws"]['port'],
            "routes": []
       }
    }
    for route in config["api"]["routes"]:
        cfg["api"]["routes"].append({
            "match": [
                {
                    "path": route["paths"]
                }
			],
            "handle": [
                {
                    "handler": "bobo_crypto_middleware"
                },
                {
                    "handler": "reverse_proxy",
                    "upstreams": [{"dial": host} for host in route["upstreams"]]
				}
		    ]
        })
    for route in config["ws"]["routes"]:
        cfg["ws"]["routes"].append({
            "match": [
                {
                    "path": route["paths"],
                    "header": {
                        "Connection": [ "*Upgrade*" ],
                        "Upgrade": [ "websocket" ]
                    }
                }
			],
            "handle": [
                {
                    "handler": "reverse_proxy",
                    "upstreams": [{"dial": host} for host in route["upstreams"]],
                    "load_balancing": {
                        "selection_policy": {
                            "policy": "ip_hash"
                        }
                    },
                    "transport": {
                        "protocol": "http",
                        "versions": [ "1.1" ],
                        "dial_timeout": "500ms",
                        "read_timeout": "60s",
                        "write_timeout": "60s"
					}
				},
                
		    ]
        })
    template['apps']['http'] ={
        "servers": cfg
    }
    with open('./run.json', 'w') as fx:
        json.dump(template, fx, indent=4,ensure_ascii=False)
        
    pass
if __name__ == '__main__':
    main()