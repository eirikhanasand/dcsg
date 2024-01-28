export const servers = [
    { name: 'manager', state: 0 }, 
    { name: 'db1', state: 0 }, 
    { name: 'ww1', state: 0 }, 
    { name: 'ww2', state: 0 }, 
    { name: 'ww3', state: 0 }, 
    { name: 'ww4', state: 0 }, 
    { name: 'balancer', state: 0 }
]

export const services = [
    { host: "manager", service: "uc status", state: '' },
    { host: "manager", service: "uc reports", state: '' }
]
