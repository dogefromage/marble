

export default function logCode(code: string)
{
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++)
    {
        let numString = (i+1).toString().padStart(4, ' ');
        
        lines[i] = numString + " " + lines[i];
    }

    return lines.join('\n');
}