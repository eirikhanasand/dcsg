export const servers = [
    { name: 'manager', state: 0 }, 
    { name: 'balancer', state: 0 }, 
    { name: 'varnish', state: 0 }, 
    { name: 'www', state: 0 }, 
    { name: 'db', state: 0 }, 
    { name: 'worker', state: 0 },
    { name: 'worker2', state: 0 },
    { name: 'worker3', state: 0 }
]

export const services = [
    { host: "manager", service: "uc status", state: '' },
    { host: "manager", service: "uc reports", state: '' }
]
