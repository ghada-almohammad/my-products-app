import './globals.css';
import HeaderBar from './components/HeaderBar';


export const metadata = {
title: 'ShopMate',
description: 'Clean product listing with URL-synced filters',
};


export default function RootLayout({ children }) {
return (
<html lang="en">
<body>
<div className="app-shell">
<HeaderBar brand={{ name: 'ShopMate', logoSrc: '/products.webp' }} />
<main className="app-main">{children}</main>
</div>
</body>
</html>
);
}