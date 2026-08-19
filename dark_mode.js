/* =========================================================
   SMARTFOOD GLOBAL DARK MODE
   ========================================================= */

(function () {

    const DARK_MODE_KEY = "smartfood-dark-mode";

    // Apply the saved dark mode
    function applyDarkMode() {

        const enabled =
            localStorage.getItem(DARK_MODE_KEY) === "enabled";

        document.body.classList.toggle("dark-mode", enabled);

    }


    // Apply dark mode when page loads
    if (document.body) {
        applyDarkMode();
    } else {
        document.addEventListener("DOMContentLoaded", applyDarkMode);
    }


    // Function used to change dark mode
    window.toggleDarkMode = function (enabled) {

        document.body.classList.toggle("dark-mode", enabled);

        localStorage.setItem(
            DARK_MODE_KEY,
            enabled ? "enabled" : "disabled"
        );

    };


    // Check current dark mode status
    window.isDarkModeEnabled = function () {

        return localStorage.getItem(DARK_MODE_KEY) === "enabled";

    };


    // Connect the Settings switch
    document.addEventListener("DOMContentLoaded", function () {

        const darkModeSwitch =
            document.getElementById("dark-mode-toggle");

        if (!darkModeSwitch) {
            return;
        }


        // Set switch to saved state
        darkModeSwitch.checked =
            window.isDarkModeEnabled();


        // Listen for switch changes
        darkModeSwitch.addEventListener("change", function () {

            window.toggleDarkMode(this.checked);

        });

    });

})();