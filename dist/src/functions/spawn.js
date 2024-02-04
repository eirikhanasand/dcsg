import pty from 'node-pty';
export default function spawn(name) {
    try {
        const terminal = pty.spawn('bash', [], {
            name: 'xterm-color',
            cols: 100,
            rows: 100,
            cwd: process.cwd(),
            env: process.env,
        });
        if (terminal) {
            setTimeout(() => {
                terminal.kill();
            }, 18000);
            return terminal;
        }
    }
    catch (error) {
        console.log(`Failed to spawn terminal for ${name}`, error);
        if (error && error.code) {
            console.error('Error code:', error.code);
        }
        if (error && error.message) {
            console.error('Error message:', error.message);
        }
        console.log(Object.values(error));
        return null;
    }
}
