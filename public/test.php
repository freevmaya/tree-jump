<head>
    <title>Test</title>
    <script src="https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js"></script>
</head>
<body>
    <h1 style="color:green">Test Page</h1>
    <script>
        vkBridge.send("VKWebAppInit", {})
            .then((response)=>{
                console.log(response);
            });

        console.log("App starting...");
        console.log("Current URL:", window.location.href);
        console.log("In iframe:", window !== window.top);
        console.log("Referrer:", document.referrer);

        // Перехват всех редиректов
        const originalPushState = history.pushState;
        history.pushState = function() {
            console.log("pushState called:", arguments);
            return originalPushState.apply(this, arguments);
        };

        window.addEventListener('beforeunload', function() {
            console.log("beforeunload - страница пытается уйти");
        });

        // Мониторинг создания iframe
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            if (tagName.toLowerCase() === 'iframe') {
                console.log("Создается iframe!", new Error().stack);
            }
            return originalCreateElement.call(this, tagName);
        };

        try {
            // Ваш основной код
            console.log("Ваше приложение инициализируется");
            
            vkBridge.send("VKWebAppInit", {})
                .then((response) => {
                    console.log("VKWebAppInit response:", response);
                })
                .catch((error) => {
                    console.error("VKWebAppInit error:", error);
                });
                
        } catch (error) {
            console.error("Критическая ошибка:", error);
        }
    </script>
</body>
</html>