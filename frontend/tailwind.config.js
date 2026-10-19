
module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            screens: {
                xs: '480px',
            },
            colors: {
                brand: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#10b981',
                    600: '#059669', // Primary professional emerald green
                    700: '#047857',
                    800: '#065f46',
                    900: '#064e3b',
                    950: '#022c22'
                },
                forest: {
                    50: '#f4fbf6',
                    100: '#e5f6eb',
                    200: '#ccecd7',
                    300: '#a3ddb8',
                    400: '#6ec392',
                    500: '#44a76f',
                    600: '#328856',
                    700: '#296c46',
                    800: '#24563a',
                    900: '#1f4731',
                    950: '#0d271a'
                }
            }
        }
    },
    plugins: []
};
