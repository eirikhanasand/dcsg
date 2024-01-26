export default function tab(longest, length) {
    let string = '';
    const tabs = (longest - length) / 4;
    if (!tabs)
        string = '\t';
    for (let i = 0; i < tabs; i++) {
        string += '\t';
    }
    for (let i = 0; i < (longest - length) % 4; i++) {
        string += ' ';
    }
    return string;
}
