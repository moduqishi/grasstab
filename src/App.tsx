import React from 'react';
import { ConfigProvider } from './config/ConfigContext';
import { DialogProvider } from './components/Dialog';
import { DesktopApp } from './components/DesktopApp';

export default function App() {
    return (
        <ConfigProvider>
            <DialogProvider>
                <DesktopApp />
            </DialogProvider>
        </ConfigProvider>
    );
}