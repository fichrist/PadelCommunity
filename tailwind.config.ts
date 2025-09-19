import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontSize: {
				'xs': ['0.875rem', { lineHeight: '1.25rem' }],     // was 0.75rem
				'sm': ['1rem', { lineHeight: '1.375rem' }],        // was 0.875rem  
				'base': ['1.125rem', { lineHeight: '1.625rem' }],  // was 1rem
				'lg': ['1.25rem', { lineHeight: '1.75rem' }],      // was 1.125rem
				'xl': ['1.375rem', { lineHeight: '1.875rem' }],    // was 1.25rem
				'2xl': ['1.625rem', { lineHeight: '2rem' }],       // was 1.5rem
				'3xl': ['2rem', { lineHeight: '2.25rem' }],        // was 1.875rem
				'4xl': ['2.375rem', { lineHeight: '2.5rem' }],     // was 2.25rem
				'5xl': ['3.125rem', { lineHeight: '1' }],          // was 3rem
				'6xl': ['3.875rem', { lineHeight: '1' }],          // was 3.75rem
				'7xl': ['4.625rem', { lineHeight: '1' }],          // was 4.5rem
				'8xl': ['6.125rem', { lineHeight: '1' }],          // was 6rem
				'9xl': ['8.125rem', { lineHeight: '1' }],          // was 8rem
			},
			fontFamily: {
				'comfortaa': ['Comfortaa', 'cursive'],
				'mystical': ['Inter', 'Comfortaa', 'system-ui', 'sans-serif'],
			},
			colors: {
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
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				sage: {
					DEFAULT: 'hsl(var(--sage))',
					foreground: 'hsl(var(--sage-foreground))'
				},
				earth: {
					DEFAULT: 'hsl(var(--earth))',
					foreground: 'hsl(var(--earth-foreground))'
				},
				celestial: {
					DEFAULT: 'hsl(var(--celestial))',
					foreground: 'hsl(var(--celestial-foreground))'
				},
				lotus: {
					DEFAULT: 'hsl(var(--lotus))',
					foreground: 'hsl(var(--lotus-foreground))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
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
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
