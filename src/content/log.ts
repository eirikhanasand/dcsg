export const servers = [
    {name: 'manager', ip: '192.168.130.128', state: 0},
    {name: 'varnish', ip: '192.168.132.227', state: 0},
    {name: 'balancer', ip: '192.168.129.18', state: 0},
    {name: 'memcache', ip: '192.168.133.38', state: 0},
    {name: 'db', ip: '192.168.131.219', state: 0},
    {name: 'www', ip: '192.168.131.245', state: 0},
    {name: 'worker', ip: '192.168.132.22', state: 0},
    {name: 'worker2', ip: '192.168.131.200', state: 0},
]

export const services = [
    { host: "manager", command: "uc status", state: '' },
    { host: "manager", command: "uc reports", state: '' }
]
