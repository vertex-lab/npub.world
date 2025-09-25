export const theme = $state({
    name: typeof document !== "undefined"
        ? document.documentElement.getAttribute("data-theme") || "dark"
        : "dark",

    get isDark() { return this.name === "dark"; },
    get isLight() { return this.name === "light"; }
});

export function toggleTheme() {
    theme.name = theme.isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme.name);
    localStorage.setItem("theme", theme.name);
}


