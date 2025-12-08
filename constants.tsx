import { Shortcut, DockItem, SearchEngineKey } from './types';
import React from 'react';

export const DEFAULT_WALLPAPER = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

export const SEARCH_ENGINES: Record<SearchEngineKey, { name: string; url: string; icon: React.ReactNode }> = {
    google: {
        name: 'Google',
        url: 'https://www.google.com/search?q=',
        icon: (
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width: '100%', height: '100%'}}><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M30.0014 16.3109C30.0014 15.1598 29.9061 14.3198 29.6998 13.4487H16.2871V18.6442H24.1601C24.0014 19.9354 23.1442 21.8798 21.2394 23.1864L21.2127 23.3604L25.4536 26.58L25.7474 26.6087C28.4458 24.1665 30.0014 20.5731 30.0014 16.3109Z" fill="#4285F4"></path> <path d="M16.2863 29.9998C20.1434 29.9998 23.3814 28.7553 25.7466 26.6086L21.2386 23.1863C20.0323 24.0108 18.4132 24.5863 16.2863 24.5863C12.5086 24.5863 9.30225 22.1441 8.15929 18.7686L7.99176 18.7825L3.58208 22.127L3.52441 22.2841C5.87359 26.8574 10.699 29.9998 16.2863 29.9998Z" fill="#34A853"></path> <path d="M8.15964 18.769C7.85806 17.8979 7.68352 16.9645 7.68352 16.0001C7.68352 15.0356 7.85806 14.1023 8.14377 13.2312L8.13578 13.0456L3.67083 9.64746L3.52475 9.71556C2.55654 11.6134 2.00098 13.7445 2.00098 16.0001C2.00098 18.2556 2.55654 20.3867 3.52475 22.2845L8.15964 18.769Z" fill="#FBBC05"></path> <path d="M16.2864 7.4133C18.9689 7.4133 20.7784 8.54885 21.8102 9.4978L25.8419 5.64C23.3658 3.38445 20.1435 2 16.2864 2C10.699 2 5.8736 5.1422 3.52441 9.71549L8.14345 13.2311C9.30229 9.85555 12.5086 7.4133 16.2864 7.4133Z" fill="#EB4335"></path> </g></svg>
        )
    },
    bing: {
        name: 'Bing',
        url: 'https://www.bing.com/search?q=',
        icon: (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{width: '100%', height: '100%'}}><title>Bing</title><path d="M11.97 7.569a.92.92 0 00-.805.863c-.013.195-.01.209.43 1.347 1 2.59 1.242 3.214 1.283 3.302.099.213.237.413.41.592.134.138.222.212.37.311.26.176.39.224 1.405.527.989.295 1.529.49 1.994.723.603.302 1.024.644 1.29 1.051.191.292.36.815.434 1.342.029.206.029.661 0 .847a2.491 2.491 0 01-.376 1.026c-.1.151-.065.126.081-.058.415-.52.838-1.408 1.054-2.213a6.728 6.728 0 00.102-3.012 6.626 6.626 0 00-3.291-4.53 104.157 104.157 0 00-1.322-.698l-.254-.133a737.941 737.941 0 01-1.575-.827c-.548-.29-.78-.406-.846-.426a1.376 1.376 0 00-.29-.045l-.093.01z" fill="url(#lobe-icons-bing-fill-0)"></path><path d="M13.164 17.24a4.385 4.385 0 00-.202.125 511.45 511.45 0 00-1.795 1.115 163.087 163.087 0 01-.989.614l-.463.288a99.198 99.198 0 01-1.502.941c-.326.2-.704.334-1.09.387-.18.024-.52.024-.7 0a2.807 2.807 0 01-1.318-.538 3.665 3.665 0 01-.543-.545 2.837 2.837 0 01-.506-1.141 2.161 2.161 0 00-.041-.182c-.008-.008.006.138.032.33.027.199.085.487.147.733.482 1.907 1.85 3.457 3.705 4.195a6.31 6.31 0 001.658.412c.22.025.844.035 1.074.017 1.054-.08 1.972-.393 2.913-.992a325.28 325.28 0 01.937-.596l.384-.244.684-.435.234-.149.009-.005.025-.017.013-.007.172-.11.597-.38c.76-.481.987-.65 1.34-.998.148-.146.37-.394.381-.425.002-.007.042-.068.088-.136a2.49 2.49 0 00.373-1.023 4.181 4.181 0 000-.847 4.336 4.336 0 00-.318-1.137c-.224-.472-.7-.9-1.383-1.245a2.972 2.972 0 00-.406-.181c-.01 0-.646.392-1.413.87a7089.171 7089.171 0 00-1.658 1.031l-.439.274z" fill="url(#lobe-icons-bing-fill-1)" fillRule="nonzero"></path><path d="M4.003 14.946l.004 3.33.042.193c.134.604.366 1.04.77 1.445a2.701 2.701 0 001.955.814c.536 0 1-.135 1.479-.43l.703-.435.556-.346V8.003c0-2.306-.004-3.675-.012-3.782a2.734 2.734 0 00-.797-1.765c-.145-.144-.268-.24-.637-.496A1780.102 1780.102 0 015.762.362C5.406.115 5.38.098 5.271.059a.943.943 0 00-1.254.696C4.003.818 4 1.659 4 6.223v5.394H4l.003 3.329z" fill="url(#lobe-icons-bing-fill-2)" fillRule="nonzero"></path><defs><radialGradient cx="93.717%" cy="77.818%" fx="93.717%" fy="77.818%" gradientTransform="scale(-1 -.7146) rotate(49.288 2.035 -2.198)" id="lobe-icons-bing-fill-0" r="143.691%"><stop offset="0%" stopColor="#00CACC"></stop><stop offset="100%" stopColor="#048FCE"></stop></radialGradient><radialGradient cx="13.893%" cy="71.448%" fx="13.893%" fy="71.448%" gradientTransform="scale(.6042 1) rotate(-23.34 .184 .494)" id="lobe-icons-bing-fill-1" r="149.21%"><stop offset="0%" stopColor="#00BBEC"></stop><stop offset="100%" stopColor="#2756A9"></stop></radialGradient><linearGradient id="lobe-icons-bing-fill-2" x1="50%" x2="50%" y1="0%" y2="100%"><stop offset="0%" stopColor="#00BBEC"></stop><stop offset="100%" stopColor="#2756A9"></stop></linearGradient></defs></svg>
        )
    },
    baidu: {
        name: '百度',
        url: 'https://www.baidu.com/s?wd=',
        icon: (
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{width: '100%', height: '100%'}}><title>Baidu</title><path d="M8.859 11.735c1.017-1.71 4.059-3.083 6.202.286 1.579 2.284 4.284 4.397 4.284 4.397s2.027 1.601.73 4.684c-1.24 2.956-5.64 1.607-6.005 1.49l-.024-.009s-1.746-.568-3.776-.112c-2.026.458-3.773.286-3.773.286l-.045-.001c-.328-.01-2.38-.187-3.001-2.968-.675-3.028 2.365-4.687 2.592-4.968.226-.288 1.802-1.37 2.816-3.085zm.986 1.738v2.032h-1.64s-1.64.138-2.213 2.014c-.2 1.252.177 1.99.242 2.148.067.157.596 1.073 1.927 1.342h3.078v-7.514l-1.394-.022zm3.588 2.191l-1.44.024v3.956s.064.985 1.44 1.344h3.541v-5.3h-1.528v3.979h-1.46s-.466-.068-.553-.447v-3.556zM9.82 16.715v3.06H8.58s-.863-.045-1.126-1.049c-.136-.445.02-.959.088-1.16.063-.203.353-.671.951-.85H9.82zm9.525-9.036c2.086 0 2.646 2.06 2.646 2.742 0 .688.284 3.597-2.309 3.655-2.595.057-2.704-1.77-2.704-3.08 0-1.374.277-3.317 2.367-3.317zM4.24 6.08c1.523-.135 2.645 1.55 2.762 2.513.07.625.393 3.486-1.975 4-2.364.515-3.244-2.249-2.984-3.544 0 0 .28-2.797 2.197-2.969zm8.847-1.483c.14-1.31 1.69-3.316 2.931-3.028 1.236.285 2.367 1.944 2.137 3.37-.224 1.428-1.345 3.313-3.095 3.082-1.748-.226-2.143-1.823-1.973-3.424zM9.425 1c1.307 0 2.364 1.519 2.364 3.398 0 1.879-1.057 3.4-2.364 3.4s-2.367-1.521-2.367-3.4C7.058 2.518 8.118 1 9.425 1z" fill="#2932E1" fillRule="nonzero"></path></svg>
        )
    },
    duckduckgo: {
        name: 'DuckDuckGo',
        url: 'https://duckduckgo.com/?q=',
        icon: (
            <svg viewBox="0 0 256 255" xmlns="http://www.w3.org/2000/svg" style={{width: '100%', height: '100%'}}><path d="M128.145,18.841 C188.147,18.841 236.788,67.482 236.788,127.484 C236.788,187.485 188.147,236.126 128.145,236.126 C68.144,236.126 19.503,187.485 19.503,127.484 C19.503,67.482 68.144,18.841 128.145,18.841" fill="#DE5833"></path><path d="M128.143,254.922 C198.526,254.922 255.583,197.865 255.583,127.482 C255.583,57.099 198.526,0.042 128.143,0.042 C57.76,0.042 0.703,57.099 0.703,127.482 C0.703,197.865 57.76,254.922 128.143,254.922 L128.143,254.922 Z M128.143,244.302 C63.625,244.302 11.323,192 11.323,127.482 C11.323,62.964 63.625,10.662 128.143,10.662 C192.661,10.662 244.963,62.964 244.963,127.482 C244.963,192 192.661,244.302 128.143,244.302 L128.143,244.302 Z" fill="#DE5833"></path><g transform="translate(66.000000, 42.000000)"><path d="M9.219,12.13 C9.198,10.303 10.525,9.28 12.288,8.563 C11.481,8.695 10.708,8.897 10.012,9.209 C8.174,10.042 6.8,13.196 6.813,14.689 C15.736,13.787 28.931,14.411 38.58,17.291 C39.292,17.191 40.004,17.091 40.727,17.008 C31.103,12.735 19.661,11.085 9.219,12.13" fill="#D5D7D8"></path><path d="M11.048,1.15 C11.249,1.114 11.453,1.089 11.655,1.055 C9.73,1.294 8.715,1.982 7.27,2.219 C8.839,2.358 14.784,5.133 18.52,6.659 C19.044,6.46 19.516,6.239 19.901,5.978 C17.964,5.692 13.151,1.342 11.048,1.15" fill="#D5D7D8"></path><path d="M20.326,22.756 C19.791,22.962 19.283,23.177 18.843,23.408 C4.298,31.071 -2.127,48.97 1.702,70.418 C5.197,89.936 19.522,156.623 26.081,187.989 C27.996,188.662 29.934,189.287 31.896,189.854 C26.055,161.614 10.112,87.614 6.392,66.831 C2.621,45.688 6.29,30.517 20.326,22.756" fill="#D5D7D8"></path><path d="M79.184,176.618 C78.944,176.778 78.658,176.928 78.353,177.074 C78.127,177.95 77.782,178.614 77.279,178.948 C74.275,180.941 65.79,181.945 61.31,180.941 C60.539,180.77 59.955,180.487 59.499,180.098 C51.85,184.345 40.85,189.999 38.616,188.725 C35.126,186.724 34.62,160.274 35.126,153.783 C35.495,148.883 52.707,156.82 61.08,160.983 C62.931,159.254 67.466,158.097 71.48,157.704 C65.415,142.943 60.942,126.059 63.684,114.086 C59.894,111.445 54.871,105.32 55.917,98.927 C56.723,94.061 69.297,84.855 78.2,84.299 C87.123,83.736 89.904,83.863 97.338,82.083 C97.71,81.994 98.119,81.896 98.547,81.793 C103.123,65.706 92.148,37.719 79.906,25.472 C75.915,21.481 69.779,18.969 62.865,17.643 C60.206,13.994 55.917,10.505 49.845,7.274 C38.57,1.288 24.636,-1.149 11.655,1.055 C11.453,1.089 11.249,1.114 11.048,1.15 C13.151,1.342 17.964,5.692 19.901,5.978 C19.516,6.239 19.044,6.46 18.52,6.659 C16.702,7.351 14.231,7.771 12.288,8.563 C10.525,9.28 9.198,10.303 9.219,12.13 C19.661,11.085 31.103,12.735 40.727,17.008 C40.004,17.091 39.292,17.191 38.58,17.291 C31.755,18.251 25.482,20.019 20.95,22.41 C20.737,22.521 20.535,22.641 20.326,22.756 C6.29,30.517 2.621,45.688 6.392,66.831 C10.112,87.614 26.1589994,162.759995 31.9999994,190.999995 C41.6029994,193.778995 50.5819993,195.999995 61.0799993,195.999995 C69.9919993,195.999995 80.7110013,194.024995 89.0000013,191.999995 C86.0890013,186.386995 82.344,180.18 80.036,175.729 C79.728,176.096 79.485,176.417 79.184,176.618 Z M85.057,70.057 C81.253,70.057 78.15,66.963 78.15,63.137 C78.15,59.329 81.253,56.234 85.057,56.234 C88.882,56.234 91.973,59.329 91.973,63.137 C91.973,66.963 88.882,70.057 85.057,70.057 L85.057,70.057 Z M89.218,44.049 C89.218,44.049 84.861,41.56 81.48,41.602 C74.532,41.693 72.64,44.763 72.64,44.763 C72.64,44.763 73.806,37.445 82.691,38.913 C87.508,39.714 89.218,44.049 89.218,44.049 L89.218,44.049 Z M15.963,53.046 C15.963,53.046 12.834,46.073 21.173,42.656 C29.521,39.238 33.586,44.601 33.586,44.601 C33.586,44.601 27.524,41.859 21.63,45.563 C15.746,49.263 15.963,53.046 15.963,53.046 L15.963,53.046 Z M23.253,67.908 C23.253,63.462 26.848,59.864 31.3,59.864 C35.74,59.864 39.34,63.462 39.34,67.908 C39.34,72.355 35.74,75.949 31.3,75.949 C26.848,75.951 23.253,72.355 23.253,67.908 L23.253,67.908 Z" fill="#FFFFFF"></path><path d="M39.34,67.908 C39.34,63.462 35.74,59.864 31.3,59.864 C26.848,59.864 23.253,63.462 23.253,67.908 C23.253,72.355 26.848,75.951 31.3,75.949 C35.74,75.949 39.34,72.355 39.34,67.908 L39.34,67.908 Z M34.862,67.317 C33.72,67.32 32.781,66.381 32.781,65.227 C32.781,64.07 33.717,63.139 34.862,63.139 C36.016,63.139 36.952,64.07 36.952,65.227 C36.952,66.381 36.016,67.317 34.862,67.317 L34.862,67.317 Z" fill="#2D4F8E"></path><path d="M34.862,63.139 C33.717,63.139 32.781,64.07 32.781,65.227 C32.781,66.381 33.72,67.32 34.862,67.317 C36.016,67.317 36.952,66.381 36.952,65.227 C36.952,64.07 36.016,63.139 34.862,63.139" fill="#FFFFFF"></path><path d="M85.057,56.234 C81.253,56.234 78.15,59.329 78.15,63.137 C78.15,66.963 81.253,70.057 85.057,70.057 C88.882,70.057 91.973,66.963 91.973,63.137 C91.973,59.329 88.882,56.234 85.057,56.234 L85.057,56.234 Z M88.124,62.628 C87.149,62.628 86.344,61.835 86.344,60.839 C86.344,59.856 87.149,59.049 88.124,59.049 C89.141,59.049 89.921,59.856 89.921,60.839 C89.921,61.835 89.141,62.628 88.124,62.628 L88.124,62.628 Z" fill="#2D4F8E"></path><path d="M88.124,59.049 C87.149,59.049 86.344,59.856 86.344,60.839 C86.344,61.835 87.149,62.628 88.124,62.628 C89.141,62.628 89.921,61.835 89.921,60.839 C89.921,59.856 89.141,59.049 88.124,59.049" fill="#FFFFFF"></path><path d="M33.586,44.601 C33.586,44.601 29.521,39.238 21.173,42.656 C12.834,46.073 15.963,53.046 15.963,53.046 C15.963,53.046 15.746,49.263 21.63,45.563 C27.524,41.859 33.586,44.601 33.586,44.601" fill="url(#linearGradient-1)"></path><path d="M82.691,38.913 C73.806,37.445 72.64,44.763 72.64,44.763 C72.64,44.763 74.532,41.693 81.48,41.602 C84.861,41.56 89.218,44.049 89.218,44.049 C89.218,44.049 87.508,39.714 82.691,38.913" fill="url(#linearGradient-1)"></path><path d="M78.2,84.299 C69.297,84.855 56.723,94.061 55.917,98.927 C54.871,105.32 59.894,111.445 63.684,114.086 C63.694,114.093 63.705,114.102 63.715,114.109 C67.504,116.745 92.733,125.256 105.25,125.02 C117.781,124.776 138.361,117.102 136.101,110.953 C133.851,104.802 113.412,116.38 92.094,114.404 C76.306,112.937 73.519,105.864 77.015,100.698 C81.412,94.205 89.421,101.93 102.631,97.977 C115.861,94.035 134.363,86.979 141.228,83.137 C157.101,74.288 134.586,70.618 129.268,73.073 C124.227,75.402 106.681,79.83 98.547,81.793 C98.119,81.896 97.71,81.994 97.338,82.083 C89.904,83.863 87.123,83.736 78.2,84.299" fill="#FDD209"></path></g><g transform="translate(100.000000, 189.000000)"><path d="M24.316,17.97 C24.316,17.049 25.057,16.234 26.233,15.539 C26.266,14.98 26.57,14.46 27.08,13.983 C18.707,9.82 1.495,1.883 1.126,6.783 C0.62,13.274 1.126,39.724 4.616,41.725 C6.85,42.999 17.85,37.345 25.499,33.098 C23.292,31.217 24.316,26.651 24.316,17.97" fill="#65BC46"></path><path d="M45.925,28.686 C45.961,28.7 46,28.715 46.036,28.729 C52.89,31.374 66.534,36.353 69.497,35.266 C73.492,33.739 72.492,1.813 68.008,0.796 C64.416,-0.001 50.665,9.688 45.255,13.635 C46.212,17.676 47.37,25.68 45.925,28.686" fill="#65BC46"></path><path d="M29.214,31.611 C24.719,30.615 26.221,26.118 26.221,15.64 C26.221,15.606 26.231,15.573 26.233,15.539 C25.057,16.234 24.316,17.049 24.316,17.97 C24.316,26.651 23.292,31.217 25.499,33.098 C25.955,33.487 26.539,33.77 27.31,33.941 C31.79,34.945 40.275,33.941 43.279,31.948 C43.782,31.614 44.127,30.95 44.353,30.074 C40.837,31.758 33.329,32.547 29.214,31.611" fill="#43A244"></path><path d="M27.08,13.983 C26.57,14.46 26.266,14.98 26.233,15.539 C26.231,15.573 26.221,15.606 26.221,15.64 C26.221,26.118 24.719,30.615 29.214,31.611 C33.329,32.547 40.837,31.758 44.353,30.074 C44.658,29.928 44.944,29.778 45.184,29.618 C45.485,29.417 45.728,29.096 45.925,28.686 C47.37,25.68 46.212,17.676 45.255,13.635 C45.044,12.746 44.844,12.046 44.683,11.636 C44.27,10.614 41.089,10.351 37.48,10.704 C33.466,11.097 28.931,12.254 27.08,13.983" fill="#65BC46"></path></g><defs><linearGradient x1="71.0046292%" y1="100%" x2="0%" y2="100%" id="linearGradient-1"><stop stopColor="#394A9F" offset="0%"></stop><stop stopColor="#6176B9" offset="100%"></stop></linearGradient></defs></svg>
        )
    }
};

export const DEFAULT_SHORTCUTS: Shortcut[] = [
    // === 视频娱乐 (Video & Entertainment) ===
    { id: 1765193991934, title: '抖音', url: 'https://www.douyin.com/', type: 'auto', color: 'from-gray-600 to-gray-800', customIcon: 'https://img.logo.dev/www.douyin.com?token=pk_dwKHjzWUSauY_R0n8QQmKQ' },
    { id: 1765194042238, title: 'bilibili', url: 'https://www.bilibili.com/', type: 'auto', color: 'from-pink-500 to-blue-500', customIcon: 'https://img.logo.dev/www.bilibili.com?token=pk_dwKHjzWUSauY_R0n8QQmKQ' },
    { id: 1765196356678, title: '爱奇艺', url: 'https://www.iqiyi.com/', type: 'auto', color: 'from-green-500 to-green-700', customIcon: 'https://img.logo.dev/www.iqiyi.com?token=pk_dwKHjzWUSauY_R0n8QQmKQ' },
    { id: 1765196407071, title: '腾讯视频', url: 'https://v.qq.com/', type: 'auto', color: 'from-orange-500 to-red-600', customIcon: 'https://icon.horse/icon/v.qq.com', iconType: 'iconhorse' },
    { id: 1765196439382, title: '芒果TV', url: 'https://www.mgtv.com/', type: 'auto', color: 'from-yellow-500 to-orange-600', iconType: 'unavatar' },
    { id: 1765196473480, title: '优酷', url: 'https://www.youku.com/', type: 'auto', color: 'from-blue-500 to-blue-700', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_10197_1764143650/256' },
    { id: 1765195218788, title: 'YouTube', url: 'https://youtube.com', type: 'auto', color: 'from-red-500 to-red-700', customIcon: 'https://img.logo.dev/youtube.com?token=pk_dwKHjzWUSauY_R0n8QQmKQ' },
    
    // === 开发工具 (Development) ===
    { id: 1765196938765, title: 'GitHub', url: 'https://github.com/', type: 'auto', color: 'from-gray-700 to-gray-900', iconType: 'logodev', customIcon: 'https://img.logo.dev/github.com?token=pk_dwKHjzWUSauY_R0n8QQmKQ' },
    
    // === 电影票务 (Movie Ticketing) ===
    { id: 1765196627763, title: '猫眼', url: 'https://www.maoyan.com/', type: 'auto', color: 'from-yellow-600 to-orange-700', iconType: 'unavatar', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_46766_1762161597/256' },
    { id: 1765196675813, title: '猫眼专业版', url: 'https://piaofang.maoyan.com/dashboard', type: 'auto', color: 'from-yellow-600 to-orange-700', iconType: 'unavatar', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_12124845_1763969293/256' },
    
    // === 音乐 (Music) ===
    { id: 1765198295426, title: 'QQ音乐', url: 'https://y.qq.com/', type: 'auto', color: 'from-green-500 to-blue-600', iconType: 'unavatar', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_6259_1765190757/256' },
    { id: 1765198343668, title: '网易云音乐', url: 'https://music.163.com/', type: 'auto', color: 'from-red-500 to-red-700', iconType: 'clearbit', customIcon: 'https://unavatar.io/music.163.com?fallback=false' },
    { id: 1765198362240, title: '喜马拉雅', url: 'https://www.ximalaya.com/', type: 'auto', color: 'from-orange-500 to-orange-700', iconType: 'unavatar' },
    
    // === 小组件 (Widgets) ===
    { id: 1765198534088, title: 'Calendar', url: '', type: 'widget', color: 'from-white to-gray-100', size: { w: 2, h: 2 }, widgetType: 'calendar', widgetContent: '' },
    
    // === AI & 技术 (AI & Tech) ===
    { id: 1765194325676, title: 'Hugging Face', url: 'https://huggingface.co/', type: 'auto', color: 'from-yellow-400 to-yellow-600', customIcon: 'https://img.logo.dev/huggingface.co?token=pk_dwKHjzWUSauY_R0n8QQmKQ' },
    { id: 1765197985565, title: '腾讯文档', url: 'https://docs.qq.com/', type: 'auto', color: 'from-blue-500 to-blue-700', iconType: 'unavatar', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_52666442_1764918437/256' },
    
    // === 学习 (Learning) ===
    { id: 1765195013236, title: '菜鸟教程', url: 'https://runoob.com', type: 'auto', color: 'from-green-500 to-green-700', customIcon: 'https://icon.horse/icon/runoob.com' },
    { id: 1765195159657, title: '学习通', url: 'https://i.chaoxing.com/base', type: 'auto', color: 'from-blue-500 to-blue-700', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_12269313_1763524961/256' },
    { id: 1765196315850, title: 'PTA', url: 'https://pintia.cn/', type: 'auto', color: 'from-purple-500 to-purple-700', iconType: 'unavatar' },
    
    // === AI 助手 (AI Assistants) ===
    { id: 1765195317537, title: 'Gemini', url: 'https://gemini.google.com', type: 'auto', color: 'from-blue-500 to-purple-600', customIcon: 'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=128' },
    { id: 1765195544793, title: 'ChatGPT', url: 'https://chatgpt.com/', type: 'auto', color: 'from-green-500 to-teal-600', iconType: 'unavatar' },
    { id: 1765195568334, title: 'Claude', url: 'https://claude.ai/', type: 'auto', color: 'from-orange-500 to-amber-600', iconType: 'unavatar' },
    { id: 1765195610054, title: 'Meta AI', url: 'https://meta.ai', type: 'auto', color: 'from-blue-600 to-purple-700', customIcon: 'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/59/06/f3/5906f39d-ff2a-41ef-873f-57d2aa989aa6/Placeholder.mill/200x200bb-75.webp' },
    { id: 1765195462659, title: 'Doubao', url: 'https://www.doubao.com', type: 'auto', color: 'from-purple-500 to-pink-600', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_54330344_1764673656/256' },
    { id: 1765195675002, title: 'DeepSeek', url: 'https://chat.deepseek.com/', type: 'auto', color: 'from-blue-600 to-indigo-700', iconType: 'unavatar' },
    { id: 1765195700715, title: 'Kimi', url: 'https://www.kimi.com/', type: 'auto', color: 'from-cyan-500 to-blue-600', iconType: 'unavatar' },
    { id: 1765195771345, title: '智谱清言', url: 'https://chatglm.cn/', type: 'auto', color: 'from-blue-500 to-blue-700', iconType: 'unavatar' },
    { id: 1765195807855, title: 'Qwen Chat', url: 'https://chat.qwen.ai/', type: 'auto', color: 'from-purple-600 to-indigo-700', customIcon: 'https://unavatar.io/chat.qwen.ai?fallback=false' },
    
    // === 社交媒体 (Social Media) ===
    { id: 1765195880965, title: '知乎', url: 'https://www.zhihu.com/', type: 'auto', color: 'from-blue-600 to-blue-800', iconType: 'clearbit' },
    { id: 1765195895356, title: '小红书', url: 'https://www.xiaohongshu.com/', type: 'auto', color: 'from-red-500 to-pink-600', iconType: 'unavatar', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_10868231_1764898028/256' },
    { id: 1765196198468, title: '斗鱼', url: 'https://www.douyu.com/', type: 'auto', color: 'from-orange-500 to-orange-700', iconType: 'unavatar', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_10921913_1764658904/256' },
    
    // === 天气 (Weather) ===
    { id: 1765198245086, title: '彩云天气', url: 'https://caiyunapp.com/map/', type: 'auto', color: 'from-blue-400 to-blue-600', iconType: 'unavatar' },
    
    // === 其他应用 (Other Apps) ===
    { id: 1765196606382, title: 'Douban', url: 'https://movie.douban.com/', type: 'auto', color: 'from-green-600 to-green-800', customIcon: 'https://unavatar.io/movie.douban.com?fallback=false' },
    { id: 1765196781842, title: '飞书', url: 'https://www.feishu.cn/', type: 'auto', color: 'from-blue-500 to-blue-700', iconType: 'unavatar' },
    { id: 1765196823194, title: '企业微信', url: 'https://work.weixin.qq.com/', type: 'auto', color: 'from-blue-500 to-blue-700', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_42270467_1763431984/256' },
    { id: 1765196874884, title: '腾讯会议', url: 'https://meeting.tencent.com/', type: 'auto', color: 'from-blue-500 to-blue-700', iconType: 'unavatar', customIcon: 'https://icons.duckduckgo.com/ip3/meeting.tencent.com.ico' },
    { id: 1765197323190, title: '微博热搜', url: 'https://weibo.com/newlogin?tabtype=search&gid=&openLoginLayer=0&url=', type: 'auto', color: 'from-orange-500 to-red-600', customIcon: 'https://img.logo.dev/weibo.com?token=pk_dwKHjzWUSauY_R0n8QQmKQ' },
    { id: 1765197603278, title: '少数派', url: 'https://sspai.com/', type: 'auto', color: 'from-red-500 to-red-700', iconType: 'unavatar' },
    
    // === 搜索引擎 (Search Engines) ===
    { id: 1765197660862, title: '百度', url: 'https://www.baidu.com/', type: 'auto', color: 'from-blue-600 to-blue-800', iconType: 'clearbit', customIcon: 'https://icon.horse/icon/www.baidu.com' },
    { id: 1765197680292, title: 'Google', url: 'https://google.com', type: 'auto', color: 'from-blue-500 to-green-600', customIcon: 'https://unavatar.io/google.com?fallback=false' },
    
    // === 设计资源 (Design Resources) ===
    { id: 1765195392428, title: 'Unsplash', url: 'https://unsplash.com/', type: 'auto', color: 'from-gray-700 to-gray-900', iconType: 'unavatar' },
    
    // === 云存储 (Cloud Storage) ===
    { id: 1765197786241, title: '123云盘', url: 'https://www.123pan.com/', type: 'auto', color: 'from-blue-500 to-blue-700', iconType: 'unavatar' },
    { id: 1765197807912, title: '百度网盘', url: 'https://pan.baidu.com/', type: 'auto', color: 'from-blue-600 to-blue-800', iconType: 'unavatar', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_116071_1764839081/256' },
    
    // === 购物 (Shopping) ===
    { id: 1765197868543, title: '淘宝', url: 'https://www.taobao.com/', type: 'auto', color: 'from-orange-500 to-red-600', iconType: 'clearbit', customIcon: 'https://icon.horse/icon/www.taobao.com' },
    { id: 1765197908143, title: '什么值得买', url: 'https://www.smzdm.com/', type: 'auto', color: 'from-red-600 to-red-800', customIcon: 'https://unavatar.io/www.smzdm.com?fallback=false' },
    
    // === 新闻 (News) ===
    { id: 1765197935324, title: '今日头条', url: 'https://www.toutiao.com/', type: 'auto', color: 'from-red-500 to-red-700', iconType: 'logodev', customIcon: 'https://img.logo.dev/www.toutiao.com?token=pk_dwKHjzWUSauY_R0n8QQmKQ' },
    
    // === 旅行 (Travel) ===
    { id: 1765198092873, title: '携程', url: 'https://www.ctrip.com/', type: 'auto', color: 'from-blue-500 to-blue-700', iconType: 'unavatar' },
    
    // === 地图 (Maps) ===
    { id: 1765198181335, title: '高德地图', url: 'https://www.amap.com/', type: 'auto', color: 'from-blue-500 to-green-600', iconType: 'unavatar', customIcon: 'https://pp.myapp.com/ma_icon/0/icon_7678_1765185623/256' },
    
    // === 天气 (Weather) ===
    { id: 1765198269787, title: '和风天气', url: 'https://www.qweather.com/', type: 'auto', color: 'from-blue-400 to-cyan-600', iconType: 'unavatar' },
    
    // === 设计工具 (Design Tools) ===
    { id: 1765197356299, title: 'Figma', url: 'https://www.figma.com/', type: 'auto', color: 'from-purple-500 to-pink-600', iconType: 'unavatar' },
];

// 系统应用列表 (可以被隐藏/恢复)
export const SYSTEM_APPS: Shortcut[] = [
    {
        id: 'ai',
        iconType: 'cpu',
        title: 'AI助手',
        isApp: true,
        type: 'sys' as const,
        color: 'from-purple-600 via-purple-500 to-pink-500'
    },
    {
        id: 'notes',
        iconType: 'sticky-note',
        title: '便笺',
        isApp: true,
        type: 'sys' as const,
        color: 'from-yellow-300 via-yellow-400 to-yellow-500'
    },
    {
        id: 'calc',
        iconType: 'calculator',
        title: '计算器',
        isApp: true,
        type: 'sys' as const,
        color: 'from-orange-400 via-orange-500 to-red-500'
    },
    {
        id: 'settings',
        iconType: 'settings',
        title: '设置',
        isApp: true,
        type: 'sys' as const,
        color: 'from-gray-400 via-gray-500 to-gray-600'
    }
];

export const DEFAULT_DOCK: DockItem[] = [
    {
        id: 'ai',
        iconType: 'cpu',
        name: 'AI',
        displayName: 'AI助手',
        title: 'AI助手',
        url: '',
        isApp: true,
        type: 'sys',
        color: 'from-purple-600 via-purple-500 to-pink-500',
        size: { w: 1, h: 1 }
    },
    {
        id: 'notes',
        iconType: 'sticky-note',
        name: 'Notes',
        displayName: '便笺',
        title: '便笺',
        url: '',
        isApp: true,
        type: 'sys',
        color: 'from-yellow-300 via-yellow-400 to-yellow-500',
        size: { w: 1, h: 1 }
    },
    {
        id: 'calc',
        iconType: 'calculator',
        name: 'Calc',
        displayName: '计算器',
        title: '计算器',
        url: '',
        isApp: true,
        type: 'sys',
        color: 'from-orange-400 via-orange-500 to-red-500',
        size: { w: 1, h: 1 }
    },
    {
        id: 'settings',
        iconType: 'settings',
        name: 'Settings',
        displayName: '设置',
        title: '设置',
        url: '',
        isApp: true,
        type: 'sys',
        color: 'from-gray-400 via-gray-500 to-gray-600',
        size: { w: 1, h: 1 }
    }
];