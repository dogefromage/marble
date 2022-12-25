
export function formatConsoleTime(time: number) {
    const date = new Date(time);

    return [ date.getHours(), date.getMinutes(), date.getSeconds()]
        .map(t => t.toString().padStart(2, '0'))
        .join(':');
}