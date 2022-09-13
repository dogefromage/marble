/**
 * https://stackoverflow.com/questions/28487352/dragndrop-datatransfer-getdata-empty
 *
 * "It works, but you might summon Cthulhu in the process."
 */
/// <reference types="react" />
export declare function setTransferData<T>(e: React.DragEvent, tag: string, data: T): void;
export declare function getTransferData<T>(e: React.DragEvent, tag: string): T | undefined;
