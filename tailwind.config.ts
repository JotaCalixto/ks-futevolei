// tailwind.config.ts
import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			gold: {
  				'50': '#FFFBEB',
  				'100': '#FEF3C7',
  				'200': '#FDE68A',
  				'300': '#FCD34D',
  				'400': '#FBBF24',
  				'500': '#D4A017',
  				'600': '#B8860B',
  				'700': '#92680A',
  				'800': '#6B4C08',
  				'900': '#422E05',
  				'950': '#1F1502'
  			},
  			graphite: {
  				'50': '#F8F8F8',
  				'100': '#EBEBEB',
  				'200': '#D1D1D1',
  				'300': '#A8A8A8',
  				'400': '#717171',
  				'500': '#484848',
  				'600': '#333333',
  				'700': '#242424',
  				'800': '#181818',
  				'900': '#0D0D0D',
  				'950': '#080808'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: 'hsl(var(--destructive))',
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			status: {
  				available: '#16A34A',
  				full: '#DC2626',
  				closed: '#717171',
  				waitlist: '#D97706',
  				confirmed: '#2563EB',
  				paid: '#16A34A',
  				dueSoon: '#D97706',
  				overdue: '#DC2626',
  				active: '#16A34A',
  				inactive: '#717171',
  				trial: '#7C3AED'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-geist-sans)',
                    ...fontFamily.sans
                ],
  			mono: [
  				'var(--font-geist-mono)',
                    ...fontFamily.mono
                ],
  			display: [
  				'var(--font-geist-sans)',
                    ...fontFamily.sans
                ]
  		},
  		fontSize: {
  			'2xs': [
  				'0.625rem',
  				{
  					lineHeight: '0.875rem'
  				}
  			],
  			xs: [
  				'0.75rem',
  				{
  					lineHeight: '1rem'
  				}
  			],
  			sm: [
  				'0.875rem',
  				{
  					lineHeight: '1.25rem'
  				}
  			],
  			base: [
  				'1rem',
  				{
  					lineHeight: '1.5rem'
  				}
  			],
  			lg: [
  				'1.125rem',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			xl: [
  				'1.25rem',
  				{
  					lineHeight: '1.75rem'
  				}
  			],
  			'2xl': [
  				'1.5rem',
  				{
  					lineHeight: '2rem'
  				}
  			],
  			'3xl': [
  				'1.875rem',
  				{
  					lineHeight: '2.25rem'
  				}
  			],
  			'4xl': [
  				'2.25rem',
  				{
  					lineHeight: '2.5rem'
  				}
  			],
  			'5xl': [
  				'3rem',
  				{
  					lineHeight: '1'
  				}
  			],
  			'6xl': [
  				'3.75rem',
  				{
  					lineHeight: '1'
  				}
  			]
  		},
  		borderRadius: {
  			none: '0',
  			sm: 'calc(var(--radius) - 4px)',
  			DEFAULT: '8px',
  			md: 'calc(var(--radius) - 2px)',
  			lg: 'var(--radius)',
  			xl: '18px',
  			'2xl': '24px',
  			'3xl': '32px',
  			full: '9999px'
  		},
  		boxShadow: {
  			sm: '0 1px 3px rgba(0, 0, 0, 0.4)',
  			DEFAULT: '0 2px 8px rgba(0, 0, 0, 0.4)',
  			md: '0 4px 12px rgba(0, 0, 0, 0.5)',
  			lg: '0 8px 24px rgba(0, 0, 0, 0.6)',
  			xl: '0 16px 48px rgba(0, 0, 0, 0.7)',
  			'2xl': '0 24px 64px rgba(0, 0, 0, 0.8)',
  			gold: '0 0 20px rgba(212, 160, 23, 0.3)',
  			'gold-sm': '0 0 10px rgba(212, 160, 23, 0.2)',
  			'gold-lg': '0 0 40px rgba(212, 160, 23, 0.4)',
  			'gold-xl': '0 0 60px rgba(212, 160, 23, 0.5)',
  			inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
  			'inset-gold': 'inset 0 1px 0 rgba(212, 160, 23, 0.1)',
  			none: 'none'
  		},
  		spacing: {
  			'13': '3.25rem',
  			'15': '3.75rem',
  			'17': '4.25rem',
  			'18': '4.5rem',
  			'22': '5.5rem',
  			'26': '6.5rem',
  			'30': '7.5rem',
  			'34': '8.5rem',
  			'68': '17rem',
  			'72': '18rem',
  			'76': '19rem',
  			'84': '21rem',
  			'88': '22rem',
  			'92': '23rem',
  			'100': '25rem',
  			'112': '28rem',
  			'128': '32rem',
  			'4.5': '1.125rem',
  			'5.5': '1.375rem',
  			'safe-bottom': 'env(safe-area-inset-bottom)',
  			'safe-top': 'env(safe-area-inset-top)',
  			'bottom-nav': '4.5rem'
  		},
  		keyframes: {
  			'gold-pulse': {
  				'0%, 100%': {
  					boxShadow: '0 0 10px rgba(212,160,23,0.2)'
  				},
  				'50%': {
  					boxShadow: '0 0 40px rgba(212,160,23,0.6)'
  				}
  			},
  			shimmer: {
  				'0%': {
  					backgroundPosition: '-200% 0'
  				},
  				'100%': {
  					backgroundPosition: '200% 0'
  				}
  			},
  			'slide-up': {
  				from: {
  					transform: 'translateY(20px)',
  					opacity: '0'
  				},
  				to: {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			'fade-in': {
  				from: {
  					opacity: '0'
  				},
  				to: {
  					opacity: '1'
  				}
  			},
  			'scale-in': {
  				from: {
  					transform: 'scale(0.92)',
  					opacity: '0'
  				},
  				to: {
  					transform: 'scale(1)',
  					opacity: '1'
  				}
  			},
  			'bounce-subtle': {
  				'0%, 100%': {
  					transform: 'translateY(0)'
  				},
  				'50%': {
  					transform: 'translateY(-4px)'
  				}
  			},
  			ping: {
  				'75%, 100%': {
  					transform: 'scale(2)',
  					opacity: '0'
  				}
  			},
  			'toast-in': {
  				from: {
  					transform: 'translateX(calc(100% + 1rem))',
  					opacity: '0'
  				},
  				to: {
  					transform: 'translateX(0)',
  					opacity: '1'
  				}
  			},
  			'toast-out': {
  				from: {
  					transform: 'translateX(0)',
  					opacity: '1'
  				},
  				to: {
  					transform: 'translateX(calc(100% + 1rem))',
  					opacity: '0'
  				}
  			},
  			'spin-slow': {
  				from: {
  					transform: 'rotate(0deg)'
  				},
  				to: {
  					transform: 'rotate(360deg)'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'gold-pulse': 'gold-pulse 2.5s ease-in-out infinite',
  			shimmer: 'shimmer 2s linear infinite',
  			'slide-up': 'slide-up 0.4s cubic-bezier(0.32, 0.72, 0, 1) both',
  			'fade-in': 'fade-in 0.3s ease-out both',
  			'scale-in': 'scale-in 0.3s cubic-bezier(0.32, 0.72, 0, 1) both',
  			'bounce-subtle': 'bounce-subtle 1.5s ease-in-out infinite',
  			ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
  			'toast-in': 'toast-in 0.3s cubic-bezier(0.32, 0.72, 0, 1) both',
  			'toast-out': 'toast-out 0.2s ease-in both',
  			'spin-slow': 'spin-slow 8s linear infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		backdropBlur: {
  			xs: '2px',
  			sm: '4px',
  			DEFAULT: '8px',
  			md: '12px',
  			lg: '16px',
  			xl: '24px'
  		},
  		zIndex: {
  			'bottom-nav': '40',
  			modal: '50',
  			toast: '60',
  			tooltip: '70',
  			overlay: '80',
  			splash: '100'
  		},
  		minHeight: {
  			'screen-safe': 'calc(100svh - env(safe-area-inset-bottom))',
  			'bottom-nav': '4.5rem'
  		},
  		maxHeight: {
  			'screen-safe': 'calc(100svh - env(safe-area-inset-bottom))',
  			modal: '85vh',
  			sheet: '92svh'
  		},
  		transitionTimingFunction: {
  			spring: 'cubic-bezier(0.32, 0.72, 0, 1)',
  			'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  			'smooth-out': 'cubic-bezier(0.4, 0, 0.2, 1)'
  		},
  		transitionDuration: {
  			'250': '250ms',
  			'350': '350ms',
  			'400': '400ms',
  			'600': '600ms',
  			'800': '800ms'
  		},
  		backgroundImage: {
  			'gold-gradient': 'linear-gradient(135deg, #D4A017 0%, #FBBF24 50%, #D4A017 100%)',
  			'gold-subtle': 'linear-gradient(135deg, rgba(212,160,23,0.15), rgba(212,160,23,0.05))',
  			'dark-gradient': 'linear-gradient(180deg, #0D0D0D 0%, #181818 100%)',
  			'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
  			'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
  			'gold-radial': 'radial-gradient(ellipse at center, rgba(212,160,23,0.2) 0%, transparent 70%)',
  			'hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(212,160,23,0.15) 0%, transparent 60%)',
  			'bottom-fade': 'linear-gradient(to top, rgba(13,13,13,1) 0%, rgba(13,13,13,0) 100%)'
  		}
  	}
  },
  plugins: [
    require('tailwindcss-animate'),
    // Plugin custom para utilitários da marca
    function({ addUtilities, theme }: { addUtilities: Function; theme: Function }) {
      addUtilities({
        // Glass card padrão
        '.glass-card': {
          background: 'rgba(255, 255, 255, 0.03)',
          borderWidth: '1px',
          borderColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        },
        // Card sólido padrão
        '.solid-card': {
          background: '#181818',
          borderWidth: '1px',
          borderColor: 'rgba(255, 255, 255, 0.10)',
        },
        // Card dourado
        '.gold-card': {
          background: 'linear-gradient(135deg, rgba(212,160,23,0.12), rgba(212,160,23,0.04))',
          borderWidth: '1px',
          borderColor: 'rgba(212, 160, 23, 0.35)',
          boxShadow: '0 0 20px rgba(212,160,23,0.15)',
        },
        // Texto gradient dourado
        '.text-gold-gradient': {
          background: 'linear-gradient(135deg, #D4A017, #FBBF24)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        },
        // Scrollbar oculta
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        // Safe padding bottom
        '.pb-safe': {
          paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)',
        },
        // Tap highlight removido (mobile)
        '.no-tap-highlight': {
          '-webkit-tap-highlight-color': 'transparent',
        },
      })
    },
  ],
}

export default config
