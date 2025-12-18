// Background Service Worker for Proxying Requests

// 监听长连接用于流式传输
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === 'stream-fetch') {
        port.onMessage.addListener(async (msg) => {
            const { url, options } = msg;
            try {
                const response = await fetch(url, options);
                
                // 发送基本响应信息
                port.postMessage({
                    type: 'response',
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries())
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    port.postMessage({ type: 'error', error: errorText });
                    return;
                }

                if (!response.body) {
                    port.postMessage({ type: 'end' });
                    return;
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        port.postMessage({ type: 'end' });
                        break;
                    }
                    // 发送数据块
                    port.postMessage({ 
                        type: 'chunk', 
                        value: Array.from(value) // 转换为普通数组以便跨 context 传输
                    });
                }
            } catch (error: any) {
                port.postMessage({ type: 'error', error: error.message });
            }
        });
    }
});
