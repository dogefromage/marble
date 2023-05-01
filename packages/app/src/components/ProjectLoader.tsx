import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { appLoadProject, selectApp } from '../slices/appSlice';
import { storeLocalProjectJson } from '../utils/projectStorage';
import React from 'react';

const ProjectLoader = () => {
    const dispatch = useAppDispatch();
    const app = useAppSelector(selectApp);

    useEffect(() => {
        if (!app.projectToLoad) {
            return;
        }
        storeLocalProjectJson(app.projectToLoad.data);
        location.reload();
    }, [app.projectToLoad]);

    const handleFileContent = (content: string) => {
        dispatch(appLoadProject({
            data: content,
        }));
    }

    return (
        <FileLoader
            openTrigger={app.displayOpenFilePopup}
            onFileContent={handleFileContent}
        />
    );
}

export default ProjectLoader;

interface FileLoaderProps {
    openTrigger: number;
    onFileContent: (content: string) => void;
}
const FileLoader = ({ onFileContent, openTrigger }: FileLoaderProps) => {
    const fileInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!fileInput.current) return;
        fileInput.current.click();
    }, [openTrigger]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = e.target.files?.[0];
            if (!file) {
                return;
            }
            const fileText = await file.text();
            onFileContent(fileText);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <input
            ref={fileInput}
            type='file'
            accept='.marble'
            style={{ display: 'none' }}
            onChange={handleFileChange}
        />
    );
}