<head>
    <title>Test</title>
    <script src="https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js"></script>

    <script>
      // Sends event to client
        vkBridge.send('VKWebAppInit')
            .then((response)=>{
                console.log(response);
            });

        vkBridge.subscribe((e) => {
            if (e.detail.type === 'VKWebAppViewHide') {
                // Действия при переключении
                // из игры или мини-приложения
                console.log(e);
            }
        });
    </script>
</head>
<body>
    <h1 style="color:green">Test Page</h1>
    <!-- Eruda is console for mobile browsers-->
    <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
    <script>eruda.init();</script>
</body>
</html>