// This component adds the dark mode script to prevent flash
export function DarkModeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          try {
            const darkMode = localStorage.getItem('darkMode');
            if (darkMode === 'true' || (!darkMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            }
          } catch (e) {}
        `,
      }}
    />
  );
}