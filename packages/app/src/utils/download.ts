
// https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server

export function download(content: string, mimeType: string, filename: string) {
    const a = document.createElement('a') // Create "a" element
    const blob = new Blob([content], { type: mimeType }) // Create a blob (file-like object)
    const url = URL.createObjectURL(blob) // Create an object URL from blob
    a.setAttribute('href', url) // Set "a" element link
    a.setAttribute('download', filename) // Set download filename
    a.click() // Start downloading
}