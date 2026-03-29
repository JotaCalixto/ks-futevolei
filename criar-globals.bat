@echo off
set FILE=src\styles\globals.css
echo @tailwind base; > %FILE%
echo @tailwind components; >> %FILE%
echo @tailwind utilities; >> %FILE%
echo. >> %FILE%
echo @layer base { >> %FILE%
echo   :root { >> %FILE%
echo     --background: 0 0%% 100%%; >> %FILE%
echo     --foreground: 0 0%% 5%%; >> %FILE%
echo     --card: 0 0%% 100%%; >> %FILE%
echo     --card-foreground: 0 0%% 5%%; >> %FILE%
echo     --primary: 43 82%% 47%%; >> %FILE%
echo     --primary-foreground: 0 0%% 5%%; >> %FILE%
echo     --secondary: 0 0%% 96%%; >> %FILE%
echo     --secondary-foreground: 0 0%% 10%%; >> %FILE%
echo     --muted: 0 0%% 96%%; >> %FILE%
echo     --muted-foreground: 0 0%% 45%%; >> %FILE%
echo     --accent: 43 82%% 47%%; >> %FILE%
echo     --accent-foreground: 0 0%% 5%%; >> %FILE%
echo     --destructive: 0 84%% 60%%; >> %FILE%
echo     --destructive-foreground: 0 0%% 98%%; >> %FILE%
echo     --border: 0 0%% 90%%; >> %FILE%
echo     --input: 0 0%% 90%%; >> %FILE%
echo     --ring: 43 82%% 47%%; >> %FILE%
echo     --radius: 0.625rem; >> %FILE%
echo   } >> %FILE%
echo   .dark { >> %FILE%
echo     --background: 0 0%% 5%%; >> %FILE%
echo     --foreground: 0 0%% 100%%; >> %FILE%
echo     --card: 0 0%% 9%%; >> %FILE%
echo     --card-foreground: 0 0%% 100%%; >> %FILE%
echo     --primary: 43 82%% 47%%; >> %FILE%
echo     --primary-foreground: 0 0%% 5%%; >> %FILE%
echo     --secondary: 0 0%% 14%%; >> %FILE%
echo     --secondary-foreground: 0 0%% 82%%; >> %FILE%
echo     --muted: 0 0%% 14%%; >> %FILE%
echo     --muted-foreground: 0 0%% 44%%; >> %FILE%
echo     --destructive: 0 63%% 51%%; >> %FILE%
echo     --destructive-foreground: 0 0%% 98%%; >> %FILE%
echo     --border: 0 0%% 20%%; >> %FILE%
echo     --input: 0 0%% 15%%; >> %FILE%
echo     --ring: 43 82%% 47%%; >> %FILE%
echo     --brand-primary: #D4A017; >> %FILE%
echo     --brand-primary-light: #FBBF24; >> %FILE%
echo     --brand-primary-dark: #92680A; >> %FILE%
echo     --brand-primary-glow: rgba(212, 160, 23, 0.2); >> %FILE%
echo     --brand-primary-border: rgba(212, 160, 23, 0.3); >> %FILE%
echo     --brand-shadow: 0 0 20px rgba(212, 160, 23, 0.25); >> %FILE%
echo     --brand-shadow-lg: 0 0 40px rgba(212, 160, 23, 0.40); >> %FILE%
echo     --brand-shimmer: rgba(212, 160, 23, 0.08); >> %FILE%
echo   } >> %FILE%
echo } >> %FILE%
echo @layer base { >> %FILE%
echo   * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; } >> %FILE%
echo   html { -webkit-text-size-adjust: 100%%; color-scheme: dark; } >> %FILE%
echo   body { background-color: #0D0D0D; color: white; min-height: 100svh; font-family: system-ui, sans-serif; } >> %FILE%
echo   h1,h2,h3,h4,h5,h6 { font-weight: 600; color: white; } >> %FILE%
echo   a { color: #D4A017; text-decoration: none; } >> %FILE%
echo } >> %FILE%
echo @layer components { >> %FILE%
echo   .glass-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); } >> %FILE%
echo   .solid-card { background: #181818; border: 1px solid rgba(255,255,255,0.10); } >> %FILE%
echo   .gold-card { background: linear-gradient(135deg,rgba(212,160,23,0.12),rgba(212,160,23,0.04)); border: 1px solid rgba(212,160,23,0.35); } >> %FILE%
echo   .input-premium { width: 100%%; padding: 0.75rem 1rem; border-radius: 0.5rem; background-color: #242424; border: 1px solid rgba(255,255,255,0.10); color: white; outline: none; } >> %FILE%
echo   .input-premium:focus { border-color: rgba(212,160,23,0.6); background-color: #2E2E2E; } >> %FILE%
echo   .btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 0.5rem; background-color: #D4A017; color: #0D0D0D; font-weight: 700; } >> %FILE%
echo   .btn-ghost { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.5rem 1rem; border-radius: 0.5rem; color: rgba(255,255,255,0.7); font-weight: 500; } >> %FILE%
echo   .no-tap-highlight { -webkit-tap-highlight-color: transparent; } >> %FILE%
echo   .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; } >> %FILE%
echo   .scrollbar-hide::-webkit-scrollbar { display: none; } >> %FILE%
echo   .page-container { display: flex; flex-direction: column; min-height: 100svh; padding-left: 1rem; padding-right: 1rem; } >> %FILE%
echo } >> %FILE%
echo .skeleton { background: linear-gradient(90deg,rgba(255,255,255,0.04) 25%%,rgba(255,255,255,0.08) 50%%,rgba(255,255,255,0.04) 75%%); background-size: 200%% 100%%; animation: shimmer 2s linear infinite; } >> %FILE%
echo @keyframes shimmer { 0%% { background-position: -200%% 0; } 100%% { background-position: 200%% 0; } } >> %FILE%
echo @keyframes gold-pulse { 0%%,100%% { box-shadow: 0 0 10px rgba(212,160,23,0.2); } 50%% { box-shadow: 0 0 40px rgba(212,160,23,0.6); } } >> %FILE%
echo. >> %FILE%
echo globals.css criado com sucesso!
